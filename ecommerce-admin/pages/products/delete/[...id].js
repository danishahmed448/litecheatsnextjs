import Layout from '@/components/Layout';
import axios from 'axios';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

const DeleteProductPage = () => {
    const router = useRouter();
    const { id } = router.query;
    const [productInfo, setProductInfo] = useState(null);

    useEffect(() => {
        if (!id) {
            return;
        }
        const getSingleProduct = async () => {
            try {
                const response = await axios.get(`/api/products?id=${id}`);
                setProductInfo(response.data)
            } catch (error) {
                console.log(error)
            }
        }
        getSingleProduct();
    }, [id])

    const goBack = () => {
        router.push('/products');
    }

    const deleteProduct = async()=>{
        await axios.delete(`/api/products?id=${id}`);
        goBack();
    }

    return (
        <Layout>
            <h1 className='text-center'>Do you really want to delete &quot;{productInfo?.title}&quot;?</h1>
            <div className='flex gap-2 justify-center'>
                <button className='btn-red' onClick={deleteProduct}>Yes</button>
                <button className='btn-default' onClick={goBack}>No</button>
            </div>
        </Layout>
    )
}

export default DeleteProductPage