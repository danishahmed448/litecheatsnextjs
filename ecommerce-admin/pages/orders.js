import Layout from '@/components/Layout';
import Spinnerdots from '@/components/Spinnerdots';
import axios from 'axios';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);
const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setloading] = useState(false);
  console.log(JSON.stringify(orders));
  useEffect(() => {
    const getAllOrders = async () => {
      setloading(true);
      try {
        const response = await axios.get('/api/orders');
        setOrders(response.data);
        setloading(false);
      } catch (error) {
        console.log(error);
      }
    };
    getAllOrders();
  }, []);
  const cancelOrder = async (e, orderId) => {
    e.preventDefault();
    try {
      const result = await MySwal.fire({
        title: 'Are you sure?',
        text: 'You will not be able to recover this order!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, cancel it!',
        cancelButtonText: 'No, keep it',
        confirmButtonColor: '#d55',
        reverseButtons: true,
      });
      if (result.isConfirmed) {
        const response = await axios.put(`/api/orders/${orderId}/cancel`);
        if (response.data.success) {
          MySwal.fire({
            title: 'Cancelled!',
            icon: 'success',
            text: 'Order has been cancelled.',
            confirmButtonColor: '#5390FF',
          });
          setOrders((prev) => prev.filter((order) => order._id !== orderId));
        }
      }
    } catch (error) {}
  };
  const sendEmail = async (e, orderId) => {
    e.preventDefault();
    try {
      const result = await MySwal.fire({
        title: 'Are you sure?',
        text: 'You are sending an email to the customer!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, cancel it!',
        cancelButtonText: 'No, keep it',
        confirmButtonColor: '#d55',
        reverseButtons: true,
      });
      if (result.isConfirmed) {
        const response = await axios.put(`/api/orders/${orderId}/sendmail`);
        if (response.data.success) {
          MySwal.fire({
            title: 'Email Sent!',
            icon: 'success',
            text: 'Email has been sent.',
            confirmButtonColor: '#5390FF',
          });
          setOrders((prev) => prev.map((order) => {
            if (order._id === orderId) {
              order.emailSent = true;
            }
            return order;
          }));
        }
      }
    } catch (error) {}
  }
  const acceptOrder = async (e, orderId) => {
    e.preventDefault();
    try {
      const result = await MySwal.fire({
        title: 'Are you sure?',
        text: 'You are confirming this order!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, accept it!',
        cancelButtonText: 'No',
        confirmButtonColor: '#d55',
        reverseButtons: true,
      });
      if (result.isConfirmed) {
        const response = await axios.put(`/api/orders/${orderId}/accept`);
        if (response.data.success) {
          MySwal.fire({
            title: 'Accepted!',
            icon: 'success',
            text: 'Order has been accepted.',
            confirmButtonColor: '#5390FF',
          });
          const updatedOrder = response.data.updatedOrder;
          setOrders((prev) =>
            prev.map((order) =>
              order._id === updatedOrder._id ? updatedOrder : order
            )
          );
        }
      }
    } catch (error) {}
  };
  return (
    <Layout>
      <h1>Orders</h1>
      <div className='table-container'>
        <table className='basic'>
          <thead>
            <tr>
              <td>Date</td>
              <td>Paid</td>
              <td>Recipient</td>
              <td>Payment Method</td>
              <td>Payment Details</td>
              <td>Total Amount</td>
              <td>Sender Details</td>
              <td>Products</td>
              <td></td>
              <td></td>
              <td></td>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={10}>
                  <div className='py-4'>
                    <Spinnerdots fullWidth={true} />
                  </div>
                </td>
              </tr>
            )}
            {orders.length > 0 &&
              orders.map((order) => (
                <tr key={order._id}>
                  <td>{new Date(order.createdAt).toLocaleString()}</td>
                  <td
                    className={order.paid ? 'text-green-600' : 'text-red-600'}
                  >
                    {order.paid ? 'YES' : 'NO'}
                  </td>
                  <td>{order.email}</td>
                  <td>{order.paymentMethod.name}</td>
                  <td>
                    {order.paymentMethod.receiverDetailsRequired.map(
                      (detail, i) => (
                        <div key={i} className='flex flex-col'>
                          <span className='font-semibold text-red-500'>
                            {detail.name}
                          </span>
                          <span className='text-sm text-green-800 font-semibold'>
                            {detail.value}
                          </span>
                        </div>
                      )
                    )}
                  </td>
                  <td>₹{order.totalAmount}</td>
                  <td>
                    {order.senderDetails.map((detail, i) => (
                      <div key={i} className='flex flex-col'>
                        <span className='font-semibold text-red-500'>
                          {detail.name}
                        </span>
                        <span className='text-sm text-green-800 font-semibold'>
                          {detail.value}
                        </span>
                      </div>
                    ))}
                  </td>
                  <td>
                    {order.line_items.map((line_item, index) => (
                      <span key={index}>
                        {line_item.price_data.product_data.name} x{' '}
                        {line_item.quantity}
                      </span>
                    ))}
                  </td>
                  {/* //button to cancel shiprocket order and refund */}
                  <td className='button-cell'>
                    {!order.paid && (
                      <Link
                        href={`#`}
                        className='btn-default'
                        onClick={(e) => acceptOrder(e, order._id)}
                      >
                        <svg
                          xmlns='http://www.w3.org/2000/svg'
                          fill='none'
                          viewBox='0 0 24 24'
                          strokeWidth={1.5}
                          stroke='currentColor'
                          className='w-6 h-6'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            d='M4.5 12.75l6 6 9-13.5'
                          />
                        </svg>
                        Accept Order
                      </Link>
                    )}
                  </td>
                  <td className='button-cell'>
                    {order.paid && !order.emailSent && (
                      <Link
                        href={`#`}
                        className='btn-default'
                        onClick={(e) => sendEmail(e, order._id)}
                      >
                        <svg
                          xmlns='http://www.w3.org/2000/svg'
                          fill='none'
                          viewBox='0 0 24 24'
                          strokeWidth={1.5}
                          stroke='currentColor'
                          className='w-6 h-6'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            d='M9 3.75H6.912a2.25 2.25 0 00-2.15 1.588L2.35 13.177a2.25 2.25 0 00-.1.661V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 00-2.15-1.588H15M2.25 13.5h3.86a2.25 2.25 0 012.012 1.244l.256.512a2.25 2.25 0 002.013 1.244h3.218a2.25 2.25 0 002.013-1.244l.256-.512a2.25 2.25 0 012.013-1.244h3.859M12 3v8.25m0 0l-3-3m3 3l3-3'
                          />
                        </svg>
                        Send Email
                      </Link>
                    )}
                  </td>
                  <td className='button-cell'>
                    <Link
                      href={`#`}
                      className='btn-red'
                      onClick={(e) => cancelOrder(e, order._id)}
                    >
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        fill='none'
                        viewBox='0 0 24 24'
                        strokeWidth={1.5}
                        stroke='currentColor'
                        className='w-4 h-4'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          d='M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0'
                        />
                      </svg>
                      Cancel Order
                    </Link>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </Layout>
  );
};

export default Orders;
