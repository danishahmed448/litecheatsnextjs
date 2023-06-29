import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import SeperateItem from './SeperateItem';
import Spinner from './Spinner';

const PaymentMethodForm = ({
  _id,
  name: existingName,
  image: existingImage,
  qrcode: existingQRCode,
  senderDetailsRequired: existingSenderDetailsRequired,
  receiverDetailsRequired: existingReceiverDetailsRequired,
  notes: existingNotes,
}) => {
  const [name, setName] = useState(existingName || '');
  const [image, setImage] = useState(existingImage || '');
  const [qrcode, setQRCode] = useState(existingQRCode || '');
  const [notes, setNotes] = useState(existingNotes || '');
  const [senderDetailsRequired, setSenderDetailsRequired] = useState(
    existingSenderDetailsRequired || []
  );
  const [receiverDetailsRequired, setReceiverDetailsRequired] = useState(
    existingReceiverDetailsRequired || []
  );
  const [goToPaymentMethods, setGoToPaymentMethods] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadQrLoading, setUploadQrLoading] = useState(false);
  const [showReceiverDetails, setShowReceiverDetails] = useState(false);
  const router = useRouter();

  const savePaymentMethod = async (e) => {
    e.preventDefault();

    const data = {
      name,
      image,
      qrcode,
      senderDetailsRequired,
      receiverDetailsRequired,
      notes,
    };

    if (_id) {
      await axios.put('/api/paymentMethods', { ...data, _id });
    } else {
      await axios.post('/api/paymentMethods', data);
    }
    setGoToPaymentMethods(true);
  };

  if (goToPaymentMethods) {
    router.push('/paymentMethods');
  }
  const uploadImage = async (e) => {
    const files = e.target.files;
    if (files?.length === 1) {
      setIsUploading(true);
      const data = new FormData();
      for (const file of files) {
        data.append('file', file);
      }
      const res = await axios.post('/api/upload', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setImage(res.data[0]);
      setIsUploading(false);
    }
  };
  const uploadQr = async (e) => {
    const files = e.target.files;
    if (files?.length === 1) {
      setUploadQrLoading(true);
      const data = new FormData();
      for (const file of files) {
        data.append('file', file);
      }
      const res = await axios.post('/api/upload', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setQRCode(res.data[0]);
      setUploadQrLoading(false);
    }
  };
  const deleteImage = async (url) => {
    try {
      const publicId = url.split('/').pop().split('.').shift();
      const response = await axios.delete(`/api/upload?publicId=${publicId}`);

      // Check if the deletion was successful
      if (response.status === 200) {
        setImage('');
      } else {
        console.error('Failed to delete image');
        // You can also display an error message to the user here, if needed.
      }
    } catch (error) {
      console.error(error);
      // You can also display an error message to the user here, if needed.
    }
  };
  const deleteQRCode = async (url) => {
    try {
      const publicId = url.split('/').pop().split('.').shift();
      const response = await axios.delete(`/api/upload?publicId=${publicId}`);

      // Check if the deletion was successful
      if (response.status === 200) {
        setQRCode('');
      } else {
        console.error('Failed to delete image');
        // You can also display an error message to the user here, if needed.
      }
    } catch (error) {
      console.error(error);
      // You can also display an error message to the user here, if needed.
    }
  };
  const addReceiverDetail = (e) => {
    e.preventDefault();
    setReceiverDetailsRequired([
      ...receiverDetailsRequired,
      { name: '', value: '' },
    ]);
  };

  const removeReceiverDetail = (index) => {
    setReceiverDetailsRequired([
      ...receiverDetailsRequired.slice(0, index),
      ...receiverDetailsRequired.slice(index + 1),
    ]);
  };
  return (
    <form onSubmit={savePaymentMethod} className='bg-white p-4 rounded-sm'>
      <label>Payment Method Name</label>
      <input
        type='text'
        placeholder='Payment Method Name'
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      {/* You will need to add image upload functionality similar to the 'ProductForm' component for 'image' and 'qrcode' */}
      <label>Image</label>
      <div className='mb-2'>
        <div className='flex flex-row gap-2 flex-wrap'>
          {isUploading && (
            <div className='relative w-24 h-24 mt-2 rounded-sm flex items-center justify-center'>
              <Spinner />
            </div>
          )}
          {!image ? (
            <></>
          ) : (
            <div className='relative w-24 h-24 bg-white border border-gray-200 mt-2 rounded-sm cursor-move p-4 shadow-sm'>
              <img className='w-full h-full object-contain' src={image} />
              <button
                className='absolute top-0 right-0 bg-gray-200 text-primary p-1 rounded-bl-sm'
                onClick={(e) => {
                  e.preventDefault();
                  deleteImage(image);
                }}
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 24 24'
                  strokeWidth={1.5}
                  stroke='currentColor'
                  className='w-3 h-3'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    d='M6 18L18 6M6 6l12 12'
                  />
                </svg>
              </button>
            </div>
          )}
          {!image && (
            <label className='w-24 h-24 flex flex-col gap-1 items-center text-center justify-center text-sm text-primary rounded-sm bg-white shadow-sm cursor-pointer border border-primary mt-2'>
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
                  d='M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5'
                />
              </svg>
              <div>Add image</div>
              <input
                multiple
                type='file'
                className='hidden'
                onChange={uploadImage}
              />
            </label>
          )}
        </div>
      </div>
      <label>QR Code</label>
      <div className='mb-2'>
        <div className='flex flex-row gap-2 flex-wrap'>
          {uploadQrLoading && (
            <div className='relative w-24 h-24 mt-2 rounded-sm flex items-center justify-center'>
              <Spinner />
            </div>
          )}
          {!qrcode ? (
            <></>
          ) : (
            <div className='relative w-24 h-24 bg-white border border-gray-200 mt-2 rounded-sm cursor-move p-4 shadow-sm'>
              <img className='w-full h-full object-contain' src={qrcode} />
              <button
                className='absolute top-0 right-0 bg-gray-200 text-primary p-1 rounded-bl-sm'
                onClick={(e) => {
                  e.preventDefault();
                  deleteQRCode(qrcode);
                }}
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 24 24'
                  strokeWidth={1.5}
                  stroke='currentColor'
                  className='w-3 h-3'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    d='M6 18L18 6M6 6l12 12'
                  />
                </svg>
              </button>
            </div>
          )}
          {!qrcode && (
            <label className='w-24 h-24 flex flex-col gap-1 items-center text-center justify-center text-sm text-primary rounded-sm bg-white shadow-sm cursor-pointer border border-primary mt-2'>
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
                  d='M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5'
                />
              </svg>
              <div>Add QRCode</div>
              <input
                multiple
                type='file'
                className='hidden'
                onChange={uploadQr}
              />
            </label>
          )}
        </div>
      </div>
      <label>Sender Details Required{' (Comma Separated)'}</label>
      <input
        type='text'
        placeholder='Sender Details Required-Example: name,email'
        value={senderDetailsRequired.join(',')}
        onChange={(e) => setSenderDetailsRequired(e.target.value.split(','))}
      />
      <SeperateItem
        name={'Receiver Details Required'}
        setShowState={setShowReceiverDetails}
        showState={showReceiverDetails}
        add={addReceiverDetail}
      >
        {receiverDetailsRequired.length > 0 &&
          receiverDetailsRequired.map((receiverDetail, index) => (
            <div key={index} className='flex flex-col mb-2 bg-bgGray p-4'>
              <div className='flex gap-1 mb-2'>
                <input
                  type='text'
                  className='mb-0'
                  placeholder='Name'
                  value={receiverDetail.name}
                  onChange={(e) => {
                    const newReceiverDetailsRequired = [
                      ...receiverDetailsRequired,
                    ];
                    newReceiverDetailsRequired[index].name = e.target.value;
                    setReceiverDetailsRequired(newReceiverDetailsRequired);
                  }}
                />
                <button
                  type='button'
                  onClick={(e) => {
                    e.preventDefault();
                    removeReceiverDetail(index);
                  }}
                  className='btn-red'
                >
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    fill='none'
                    viewBox='0 0 24 24'
                    strokeWidth={1.5}
                    stroke='currentColor'
                    className='w-3 h-3'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      d='M6 18L18 6M6 6l12 12'
                    />
                  </svg>
                </button>
              </div>
              <input
                type='text'
                placeholder='Value'
                value={receiverDetail.value}
                onChange={(e) => {
                  const newReceiverDetailsRequired = [
                    ...receiverDetailsRequired,
                  ];
                  newReceiverDetailsRequired[index].value = e.target.value;
                  setReceiverDetailsRequired(newReceiverDetailsRequired);
                }}
              />
            </div>
          ))}
      </SeperateItem>
      <label>Notes</label>
      <textarea
        rows={7}
        placeholder='Notes'
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />
      <button type='submit' className='btn-primary'>
        Save
      </button>
    </form>
  );
};

export default PaymentMethodForm;
