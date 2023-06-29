import Layout from '@/components/Layout';
import PaymentMethodForm from '@/components/PaymentMethodForm';
import Spinnerdots from '@/components/Spinnerdots';
import axios from 'axios';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
const MySwal = withReactContent(Swal);
const EditProductPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [productInfo, setProductInfo] = useState(null);
  const [isLoading, setisLoading] = useState(false);
  useEffect(() => {
    if (!id) {
      return;
    }
    const getSingleProduct = async () => {
      try {
        setisLoading(true);
        const response = await axios.get(`/api/paymentMethods?id=${id}`);
        setProductInfo(response.data);
      } catch (error) {
        console.log(error)
        setisLoading(false);
        await MySwal.fire({
          title: 'Error!',
          icon: 'error',
          text:error?.response?.data?.message || error?.message,
          confirmButtonColor: '#d55',
        });
      }
      setisLoading(false);
    };
    getSingleProduct();
  }, [id]);

  return (
    <Layout>
      <h1>Edit Payment Method</h1>
      {isLoading && <Spinnerdots fullWidth />}
      {productInfo && <PaymentMethodForm {...productInfo} />}
    </Layout>
  );
};

export default EditProductPage;
