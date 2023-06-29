import { Setting } from '@/models/Setting';
import mongooseConnect from './mongoose';
import { Order } from '@/models/Order';
import sendEmail from './email';
import { sendTwilioSms } from './sms';

const { default: axios } = require('axios');

export const getShiprocketToken = async () => {
  try {
    const response = await axios.post(
      'https://apiv2.shiprocket.in/v1/external/auth/login',
      {
        email: process.env.SHIPROCKET_EMAIL,
        password: process.env.SHIPROCKET_PASSWORD,
      }
    );

    return response.data.token;
  } catch (error) {
    if (error.response && error.response.data && error.response.data.message) {
      console.log(error.response.data.message);
    } else {
      console.log(error);
    }
    return null;
  }
};

const parseAndConvertBoxSize = (boxSize) => {
  const [length, breadth, height] = boxSize
    .split('x')
    .map((dimension) => Number(dimension));
  return { length, breadth, height, volume: length * breadth * height };
};

function convertCmToIn(cmVolume) {
  const conversionFactor = 0.0610237;
  const inVolume = cmVolume * conversionFactor;
  return inVolume;
}

const getBoxes = (boxes, totalVolume) => {
  let boxesNeeded = [];
  let currentRemainingVolume = totalVolume;
  while (currentRemainingVolume > 0) {
    let boxesWithRemainingVolume = boxes.map((box) => ({
      ...box,
      remainingVolume: currentRemainingVolume - box.volume,
    }));
    let positiveBoxes = boxesWithRemainingVolume.filter(
      (box) => box.remainingVolume >= 0
    );

    if (positiveBoxes.length === 0) {
      if (boxesWithRemainingVolume.every((box) => box.remainingVolume !== 0)) {
        boxesWithRemainingVolume.sort(
          (a, b) => b.remainingVolume - a.remainingVolume
        );
        let selectedBox = boxesWithRemainingVolume[0];
        boxesNeeded.push(
          boxes.find(
            (box) =>
              box.volume === selectedBox.volume &&
              box.length === selectedBox.length &&
              box.breadth === selectedBox.breadth &&
              box.height === selectedBox.height &&
              box.price === selectedBox.price
          )
        );
      }
      break; // No more boxes can fit, exit the loop
    }
    positiveBoxes.sort((a, b) => a.remainingVolume - b.remainingVolume);
    let selectedBox = positiveBoxes[0];
    currentRemainingVolume = selectedBox.remainingVolume;
    boxesNeeded.push(
      boxes.find(
        (box) =>
          box.volume === selectedBox.volume &&
          box.length === selectedBox.length &&
          box.breadth === selectedBox.breadth &&
          box.height === selectedBox.height &&
          box.price === selectedBox.price
      )
    );
  }
  let totalPriceOfBoxes = 0;
  let totalBoxVolume = 0;
  for (const box of boxesNeeded) {
    totalBoxVolume += box.volume;
    totalPriceOfBoxes += box.price;
  }
  const approximateSize = Math.cbrt(totalBoxVolume) * 2.54; //Converting to cm
  boxesNeeded = boxesNeeded.map((box) => ({
    boxSize: [box.length, box.breadth, box.height].join('x'),
    price: box.price,
  }));
  return {
    totalLength: approximateSize,
    totalBreadth: approximateSize,
    totalHeight: approximateSize,
    boxesNeeded,
    totalPriceOfBoxes,
  };
};

export const getShippingFee = async (orderId, token) => {
  const options = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  try {
    const url = `https://apiv2.shiprocket.in/v1/external/courier/serviceability/?order_id=${orderId}`;
    const response = await axios.get(url, options);
    return {
      realShippingFee:
        response.data.data.available_courier_companies[0].freight_charge,
      courierId:
        response.data.data.available_courier_companies[0].courier_company_id,
      courierName:
        response.data.data.available_courier_companies[0].courier_name,
    };
  } catch (error) {
    if (error.response && error.response.data && error.response.data.message) {
      console.log(error.response.data.message);
    } else {
      console.log(error);
    }
    return null;
  }
};

export const createShippingOrder = async (orderId) => {
  try {
    const token = await getShiprocketToken();
    await mongooseConnect();
    const order = await Order.findById(orderId);
    const order_items = order.line_items.map((line_item) => {
      const name = line_item.price_data.product_data.name;
      const units = line_item.quantity;
      const selling_price =
        line_item.price_data.product_data.metadata.selling_price;
      const sku = line_item.price_data.product_data.metadata.productId;

      return {
        name,
        units,
        selling_price,
        sku,
      };
    });
    const plasticStretchFilm = await Setting.findOne({
      name: 'plasticStretchFilm',
    });
    const filmLengthInInches = plasticStretchFilm.value.length;
    const filmDistanceInMetres = plasticStretchFilm.value.distance;
    const filmTotalPrice = plasticStretchFilm.value.price;
    let shippingCharge = 0;
    let totalVolume = 0;
    let totalWeight = 0;
    let totalAmount = 0;
    for (const lineItem of order.line_items) {
      const { length, breadth, height, weight, selling_price } =
        lineItem.price_data.product_data.metadata;
      const units = lineItem.quantity;
      totalVolume += length * breadth * height * units;
      totalWeight += weight * units;
      totalAmount += selling_price * units;
      // Convert cm to inches
      let lengthInInches = length / 2.54;
      let breadthInInches = breadth / 2.54;
      let heightInInches = height / 2.54;

      // Calculate total surface area in square inches for one unit
      let totalSurfaceAreaPerUnit =
        2 *
        (lengthInInches * breadthInInches +
          breadthInInches * heightInInches +
          heightInInches * lengthInInches);

      // Calculate the length of film required to wrap one unit of the product in inches
      let filmRequiredPerUnit = totalSurfaceAreaPerUnit / filmLengthInInches;

      // Calculate the total length of film required to wrap all units of the product in inches
      let totalFilmRequired = filmRequiredPerUnit * units;
      let totalFilmRequiredInMeters = totalFilmRequired * 0.0254;
      let pricePerMetre = filmTotalPrice / filmDistanceInMetres;
      shippingCharge += totalFilmRequiredInMeters * pricePerMetre;
    }
    const boxes = await Setting.findOne({ name: 'boxes' });
    const convertBoxes = boxes.value.map((box) => ({
      ...parseAndConvertBoxSize(box.boxSize),
      price: Number(box.price),
    }));
    const {
      totalLength,
      totalBreadth,
      totalHeight,
      boxesNeeded,
      totalPriceOfBoxes,
    } = getBoxes(convertBoxes, convertCmToIn(totalVolume));
    const tapeCharge = await Setting.findOne({ name: 'tapeCharge' });
    const tapeChargePerMetre = tapeCharge.value;
    const totalLengthInMeters = totalLength / 100; // convert cm to meters
    const totalBreadthInMeters = totalBreadth / 100; // convert cm to meters
    const totalHeightInMeters = totalHeight / 100; // convert cm to meters

    const totalTapeLength =
      4 * (totalLengthInMeters + totalBreadthInMeters + totalHeightInMeters);

    const totalTapeCharge = totalTapeLength * tapeChargePerMetre;
    shippingCharge += totalPriceOfBoxes;
    shippingCharge += totalTapeCharge;
    const smsFee = await Setting.findOne({ name: 'smsCost' });
    shippingCharge += Number(smsFee.value);

    order.boxesNeeded = boxesNeeded;

    const data = {
      order_id: order._id,
      order_date: order.createdAt,
      pickup_location: 'Primary',
      billing_customer_name: order.name,
      billing_last_name: '',
      billing_address: `${order.houseNumber}`,
      billing_address_2: `${order.streetAddress}`,
      billing_city: order.city,
      billing_pincode: order.postalCode,
      billing_state: order.state,
      billing_country: 'India',
      billing_email: order.email,
      billing_phone: order.mobileNumber,
      shipping_is_billing: true,
      order_items: order_items,
      payment_method: 'Prepaid',
      sub_total: totalAmount,
      weight: totalWeight,
      length: totalLength,
      breadth: totalBreadth,
      height: totalHeight,
    };

    const response = await axios.post(
      'https://apiv2.shiprocket.in/v1/external/orders/create/adhoc',
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    let shiprocketOrder = {};
    if (response.data) {
      shiprocketOrder = response.data;
      order.shiprocketOrderId = shiprocketOrder.order_id;
      order.shiprocketShipmentId = shiprocketOrder.shipment_id;
      order.shippingStatus = 'Order created';
      const { realShippingFee, courierId, courierName } = await getShippingFee(
        shiprocketOrder.order_id,
        token
      );
      order.shippingFee = shippingCharge + realShippingFee;
      order.totalAmount = order.shippingFee + totalAmount;
      order.courierId = courierId;
      order.courierName = courierName;
      await order.save();
      return order.shippingFee;
    }
  } catch (error) {
    if (error.response && error.response.data && error.response.data.message) {
      console.log(error.response.data.message);
    } else {
      console.log(error);
    }
    return null;
  }
};

export const getShippingFeeWithoutOrderId = async (
  delivery_postcode,
  line_items
) => {
  try {
    const token = await getShiprocketToken();
    await mongooseConnect();
    const options = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    const plasticStretchFilm = await Setting.findOne({
      name: 'plasticStretchFilm',
    });
    const filmLengthInInches = plasticStretchFilm.value.length;
    const filmDistanceInMetres = plasticStretchFilm.value.distance;
    const filmTotalPrice = plasticStretchFilm.value.price;
    let shippingCharge = 0;
    let totalVolume = 0;
    let totalWeight = 0;

    for (const lineItem of line_items) {
      const { length, breadth, height, weight } =
        lineItem.price_data.product_data.metadata;
      const units = lineItem.quantity;
      totalVolume += length * breadth * height * units;
      totalWeight += weight * units;

      // Convert cm to inches
      let lengthInInches = length / 2.54;
      let breadthInInches = breadth / 2.54;
      let heightInInches = height / 2.54;

      // Calculate total surface area in square inches for one unit
      let totalSurfaceAreaPerUnit =
        2 *
        (lengthInInches * breadthInInches +
          breadthInInches * heightInInches +
          heightInInches * lengthInInches);

      // Calculate the length of film required to wrap one unit of the product in inches
      let filmRequiredPerUnit = totalSurfaceAreaPerUnit / filmLengthInInches;

      // Calculate the total length of film required to wrap all units of the product in inches
      let totalFilmRequired = filmRequiredPerUnit * units;
      let totalFilmRequiredInMeters = totalFilmRequired * 0.0254;
      let pricePerMetre = filmTotalPrice / filmDistanceInMetres;
      shippingCharge += totalFilmRequiredInMeters * pricePerMetre;
    }
    const boxes = await Setting.findOne({ name: 'boxes' });
    const convertBoxes = boxes.value.map((box) => ({
      ...parseAndConvertBoxSize(box.boxSize),
      price: Number(box.price),
    }));
    const { totalLength, totalBreadth, totalHeight, totalPriceOfBoxes } =
      getBoxes(convertBoxes, convertCmToIn(totalVolume));
    const tapeCharge = await Setting.findOne({ name: 'tapeCharge' });
    const tapeChargePerMetre = tapeCharge.value;
    const totalLengthInMeters = totalLength / 100; // convert cm to meters
    const totalBreadthInMeters = totalBreadth / 100; // convert cm to meters
    const totalHeightInMeters = totalHeight / 100; // convert cm to meters

    const totalTapeLength =
      4 * (totalLengthInMeters + totalBreadthInMeters + totalHeightInMeters);

    const totalTapeCharge = totalTapeLength * tapeChargePerMetre;
    shippingCharge += totalPriceOfBoxes;
    shippingCharge += totalTapeCharge;
    const smsFee = await Setting.findOne({ name: 'smsCost' });
    shippingCharge += Number(smsFee.value);
    const pickupUrl =
      'https://apiv2.shiprocket.in/v1/external/settings/company/pickup';
    const pickupResponse = await axios.get(pickupUrl, options);
    const pickup_postcode =
      pickupResponse.data.data.shipping_address[0].pin_code;
    const url = `https://apiv2.shiprocket.in/v1/external/courier/serviceability/?pickup_postcode=${pickup_postcode}&delivery_postcode=${delivery_postcode}&weight=${totalWeight}&cod=0`;
    const shippingResponse = await axios.get(url, options);
    const shippingCompany =
      shippingResponse.data.data.available_courier_companies[0];
    const shippingCompanyCharge = shippingCompany.freight_charge;
    const estimatedDeliveryDays = shippingCompany.estimated_delivery_days;
    return {
      shippingFee: Math.floor(
        Number(shippingCompanyCharge) + Number(shippingCharge)
      ),
      estimatedDeliveryDays,
    };
  } catch (error) {
    if (error.response && error.response.data && error.response.data.message) {
      console.log(error.response.data.message);
    } else {
      console.log(error);
    }
    return null;
  }
};

export const cancelOrder = async (orderId) => {
  try {
    await mongooseConnect();
    const order = await Order.findById(orderId);
    if (order.shipmentOrderCancelled) return true;
    const ids = [order.shiprocketOrderId];
    const url = 'https://apiv2.shiprocket.in/v1/external/orders/cancel';
    const token = await getShiprocketToken();
    const options = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    const response = await axios.post(url, { ids }, options);
    if (response.data && response.data.status_code === 200) {
      order.shipmentOrderCancelled = true;
      await order.save();
      return true;
    } else {
      return false;
    }
  } catch (error) {
    if (error.response && error.response.data && error.response.data.message) {
      console.log(error.response.data.message);
    } else {
      console.log(error);
    }
    return null;
  }
};

export const cancelShipment = async (orderId) => {
  try {
    await mongooseConnect();
    const order = await Order.findById(orderId);
    if (order.shipmentCancelled) return true;
    const awbs = [order.awbCode];
    const url =
      'https://apiv2.shiprocket.in/v1/external/orders/cancel/shipment/awbs';
    const token = await getShiprocketToken();
    const options = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    const response = await axios.post(url, { awbs }, options);

    if (
      response.data &&
      response.data.message &&
      response.data.message ===
        'Bulk Shipment(s) cancellation is in progress. Please wait for 24 hours.'
    ) {
      order.shipmentCancelled = true;
      await order.save();
      return true;
    } else {
      return false;
    }
  } catch (error) {
    if (error.response && error.response.data && error.response.data.message) {
      console.log(error.response.data.message);
    } else {
      console.log(error);
    }
    return null;
  }
};

export const getShiprocketOrderStatus = async (shiprocketOrderId) => {
  try {
    const token = await getShiprocketToken();
    const options = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    const url = `https://apiv2.shiprocket.in/v1/external/orders/show/${shiprocketOrderId}`;
    const response = await axios.get(url, options);
    if (response.data && response.data.data && response.data.data.status) {
      if (response.data.data.status === 'NEW') {
        return 'Order Created';
      } else {
        return response.data.data.status;
      }
    } else {
      throw new Error('Error getting order status from Shiprocket');
    }
  } catch (error) {
    if (error.response && error.response.data && error.response.data.message) {
      console.log(error.response.data.message);
    } else {
      console.log(error);
    }
    return null;
  }
};

export const updateOrderStatus = async (orderId) => {
  try {
    // Get the order from your Order schema
    const order = await Order.findById(orderId);
    // Get the current status of the order on Shiprocket
    const shiprocketOrderStatus = await getShiprocketOrderStatus(
      order.shiprocketOrderId
    );

    // Update the order status in your Order schema
    if (shiprocketOrderStatus !== order.shippingStatus) {
      // Generate the email subject and message
      const subject = `Order Status Update for your Order ${orderId}`;
      const message = `Dear customer, the status of your order has been updated. Your new order status is: ${shiprocketOrderStatus}. Thank you for shopping with Flavors Of Kalimpong!`;

      // Send the email to the customer
      await sendEmail(order.email, subject, message);
      order.shippingStatus = shiprocketOrderStatus;
      await order.save();
      return true;
    } else {
      return false;
    }
  } catch (error) {
    if (error.response && error.response.data && error.response.data.message) {
      console.log(error.response.data.message);
    } else {
      console.log(error);
    }
    return null;
  }
};

export const getTrackingUrl = async (awbCode) => {
  try {
    const token = await getShiprocketToken();
    const options = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    };
    const url = `https://apiv2.shiprocket.in/v1/external/courier/track/awb/${awbCode}`;
    const response = await axios.get(url, options);
    const trackingData = response.data;
    if (
      trackingData &&
      trackingData.tracking_data &&
      trackingData.tracking_data.track_url
    ) {
      return trackingData.tracking_data.track_url;
    } else {
      return false;
    }
  } catch (error) {
    if (error.response && error.response.data && error.response.data.message) {
      console.log(error.response.data.message);
    } else {
      console.log(error);
    }
    return null;
  }
};

export const generateAWB = async (orderId) => {
  try {
    const token = await getShiprocketToken();
    const options = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    const order = await Order.findById(orderId);
    const data = {
      shipment_id: order.shiprocketShipmentId,
      courier_id: order.courierId,
    };

    const url = 'https://apiv2.shiprocket.in/v1/external/courier/assign/awb';
    const response = await axios.post(url, data, options);

    // Extract the information you need
    const awbResponseData = response.data;

    if (
      awbResponseData?.awb_assign_status &&
      awbResponseData?.awb_assign_status === 1
    ) {
      order.awbCode = awbResponseData.response.data.awb_code;
      // Get tracking url and save it to order
      const trackUrl = await getTrackingUrl(
        awbResponseData.response.data.awb_code
      );
      order.trackUrl = trackUrl;
      const message = `Your order has been shipped and your AWB Code is ${awbResponseData.response.data.awb_code}. You can track it using this URL: ${trackUrl}`;
      const sid = await sendTwilioSms(order.mobileNumber, message);
      if (sid) {
        order.smsSentForAWB = true;
      }
      await order.save();
      return true;
    } else {
      return false;
    }
  } catch (error) {
    if (error.response && error.response.data && error.response.data.message) {
      console.log(error.response.data.message);
    } else {
      console.log(error);
    }
    return null;
  }
};

export const requestShipmentPickup = async (orderId) => {
  try {
    const token = await getShiprocketToken();
    const options = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    const order = await Order.findById(orderId);
    const data = { shipment_id: [order.shiprocketShipmentId] };
    const url =
      'https://apiv2.shiprocket.in/v1/external/courier/generate/pickup';
    const response = await axios.post(url, data, options);

    // Extract the information you need
    const pickupResponseData = response.data;
    if (pickupResponseData.pickup_status === 1) {
      // Update your order object with any necessary information
      // from the response. For example:
      order.pickupScheduledDate =
        pickupResponseData.response.pickup_scheduled_date;
      await order.save();
      return true;
    } else {
      return false;
    }
  } catch (error) {
    if (error.response && error.response.data && error.response.data.message) {
      console.log(error.response.data.message);
    } else {
      console.log(error);
    }
    return null;
  }
};

export const generateManifest = async (orderId) => {
  try {
    const token = await getShiprocketToken();
    const options = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    const order = await Order.findById(orderId);
    const data = { shipment_id: [order.shiprocketShipmentId] };
    const url = 'https://apiv2.shiprocket.in/v1/external/manifests/generate';
    const response = await axios.post(url, data, options);
    const manifestResponseData = response.data;
    if (manifestResponseData.status && manifestResponseData.status === 1) {
      order.manifestUrl = manifestResponseData.manifest_url;
      await order.save();
      return true;
    } else {
      return false;
    }
  } catch (error) {
    if (error.response && error.response.data && error.response.data.message) {
      console.log(error.response.data.message);
    } else {
      console.log(error);
    }
    return null;
  }
};

export const generateLabel = async (orderId) => {
  try {
    const token = await getShiprocketToken();
    const options = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    const order = await Order.findById(orderId);
    const data = { shipment_id: [order.shiprocketShipmentId] };
    const url =
      'https://apiv2.shiprocket.in/v1/external/courier/generate/label';
    const response = await axios.post(url, data, options);
    const labelResponseData = response.data;
    if (
      labelResponseData.label_created &&
      labelResponseData.label_created === 1
    ) {
      order.labelUrl = labelResponseData.label_url;
      await order.save();
      return true;
    } else {
      return false;
    }
  } catch (error) {
    if (error.response && error.response.data && error.response.data.message) {
      console.log(error.response.data.message);
    } else {
      console.log(error);
    }
    return null;
  }
};

export const generateInvoice = async (orderId) => {
  try {
    const token = await getShiprocketToken();
    const options = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    const order = await Order.findById(orderId);
    const data = { ids: [order.shiprocketOrderId] };
    const url = 'https://apiv2.shiprocket.in/v1/external/orders/print/invoice';
    const response = await axios.post(url, data, options);
    const invoiceResponseData = response.data;

    if (invoiceResponseData.is_invoice_created) {
      order.invoiceUrl = invoiceResponseData.invoice_url;
      await order.save();
      return true;
    } else {
      return false;
    }
  } catch (error) {
    if (error.response && error.response.data && error.response.data.message) {
      console.log(error.response.data.message);
    } else {
      console.log(error);
    }
    return null;
  }
};

export const shipProduct = async (orderId) => {
  try {
    const awbGenerated = await generateAWB(orderId);
    if (awbGenerated) {
      const shipmentPickupGenerated = await requestShipmentPickup(orderId);
      if (shipmentPickupGenerated) {
        await generateManifest(orderId);
        await generateLabel(orderId);
        await generateInvoice(orderId);
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  } catch (error) {
    if (error.response && error.response.data && error.response.data.message) {
      console.log(error.response.data.message);
    } else {
      console.log(error);
    }
    return null;
  }
};
export const shipProductWithoutAWB = async (orderId) => {
  try {
    const shipmentPickupGenerated = await requestShipmentPickup(orderId);
    if (shipmentPickupGenerated) {
      await generateManifest(orderId);
      await generateLabel(orderId);
      await generateInvoice(orderId);
      return true;
    } else {
      return false;
    }
  } catch (error) {
    if (error.response && error.response.data && error.response.data.message) {
      console.log(error.response.data.message);
    } else {
      console.log(error);
    }
    return null;
  }
};

export const getTrackingThroughAWB = async (awbCode) => {
  //get tracking url
  try {
    const token = await getShiprocketToken();
    const options = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    const url = `https://apiv2.shiprocket.in/v1/external/courier/track/awb/${awbCode}`;
    const response = await axios.get(url, options);
    const trackingResponseData = response.data;
    if (
      trackingResponseData &&
      trackingResponseData.tracking_data &&
      trackingResponseData.tracking_data.track_url
    ) {
      return trackingResponseData.tracking_data.track_url;
    } else {
      return false;
    }
  } catch (error) {
    if (error.response && error.response.data && error.response.data.message) {
      console.log(error.response.data.message);
    } else {
      console.log(error);
    }
    return null;
  }
};
