import Layout from '@/components/Layout';
import Spinnerdots from '@/components/Spinnerdots';
import axios from 'axios';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);
const AdminsPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setloading] = useState(false);
  const [admins, setAdmins] = useState([]);
  const getAllAdmins = async () => {
    try {
      setloading(true);
      const response = await axios.get('/api/admins');
      setAdmins(response.data);
      setloading(false);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getAllAdmins();
  }, []);
  const addAdmin = async (e) => {
    e.preventDefault();
    try {
        await axios.post('/api/admins', { email });
        await getAllAdmins();
        await MySwal.fire({
            title: 'Admin created!',
            icon:'success',
            confirmButtonColor: '#5390FF',
          });
    } catch (error) {
        setEmail('');
        console.log(error)
        await MySwal.fire({
            title: 'Error!',
            icon: 'error',
            text:error?.response?.data?.message || error?.message,
            confirmButtonColor: '#d55',
          });
    }
    setEmail('');
  };
  const deleteAdmin = async (e, admin) => {
    e.preventDefault();
    const result = await MySwal.fire({
      title: 'Are you sure?',
      text: `Do you want to delete ${admin.email}?`,
      showCancelButton: true,
      cancelButtonText: 'No',
      confirmButtonText: 'Yes, Delete!',
      confirmButtonColor: '#d55',
      reverseButtons: true,
    });
    if (result.isConfirmed) {
      await axios.delete(`/api/admins?id=${admin._id}`);
      await getAllAdmins();
      await MySwal.fire({
        title: 'Admin deleted!',
        icon:'success',
        confirmButtonColor: '#5390FF',
      });
      
    }
  };
  return (
    <Layout>
      <h1>Admins</h1>
      <labl>Add new admin</labl>
      <form onSubmit={addAdmin}>
        <div className='bg-white p-4 my-2'>
          <div className='flex flex-col sm:flex-row gap-2 sm:gap-0'>
            <input
              type='text'
              placeholder='Google email'
              value={email}
              className='mb-0'
              onChange={(e) => setEmail(e.target.value)}
            />
            <button type='submit' className='btn-primary w-fit'>
              Add
            </button>
          </div>
        </div>
      </form>
      <div className='table-container'>
        <table className='basic mt-2'>
          <thead>
            <tr>
              <td className='text-left'>Admin google email</td>
              <td></td>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={3}>
                  <div className='py-4'>
                    <Spinnerdots fullWidth={true} />
                  </div>
                </td>
              </tr>
            )}
            {admins.length > 0 &&
              admins.map((admin) => (
                <tr key={admin._id}>
                  <td>{admin.email}</td>
                  <td className='.button-cell'>
                    <Link
                      href={`#`}
                      className='btn-red'
                      onClick={(e) => deleteAdmin(e, admin)}
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
                      Delete
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

export default AdminsPage;
