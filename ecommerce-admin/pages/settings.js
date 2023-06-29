import Layout from '@/components/Layout';
import Spinnerdots from '@/components/Spinnerdots';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);
const SettingsPage = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [featuredProductId, setFeaturedProductId] = useState('');
  const [adminMobile, setAdminMobile] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [smsCost, setSmsCost] = useState('');
  const [boxes, setBoxes] = useState([]);
  const [stripeProcessingFee, setStripeProcessingFee] = useState('');
  const [tapeCharge, setTapeCharge] = useState('');
  const [showBox, setShowBox] = useState(false);
  const [showFaqs, setShowFaqs] = useState(false);
  //Faqs where faqs has category and question and answer
  const [faqCategories, setFaqCategories] = useState([]);

  const [plasticStretchFilm, setplasticStretchFilm] = useState({
    length: '',
    distance: '',
    price: '',
  });
  useEffect(() => {
    const getAllProducts = async () => {
      try {
        const response = await axios.get('/api/products');
        setProducts(response.data);
        if (response.data[0]) {
          setFeaturedProductId(response.data[0]._id);
        }
      } catch (error) {
        console.log(error);
      }
    };
    const getFeaturedProduct = async () => {
      try {
        const response = await axios.get(
          `/api/settings?name=featuredProductId`
        );
        if (response.data.value) {
          setFeaturedProductId(response.data.value);
        }
      } catch (error) {}
    };
    const getAdminMobile = async () => {
      try {
        const response = await axios.get(`/api/settings?name=adminMobile`);
        setAdminMobile(response.data.value);
      } catch (error) {}
    };
    const getAdminEmail = async () => {
      try {
        const response = await axios.get(`/api/settings?name=adminEmail`);
        setAdminEmail(response.data.value);
      } catch (error) {}
    };
    const getSmsCost = async () => {
      try {
        const response = await axios.get(`/api/settings?name=smsCost`);
        setSmsCost(response.data.value);
      } catch (error) {}
    };
    const getStripeProcessingFee = async () => {
      try {
        const response = await axios.get(
          `/api/settings?name=stripeProcessingFee`
        );
        setStripeProcessingFee(response.data.value);
      } catch (error) {}
    };
    const getAllFaqCategories = async () => {
      try {
        const response = await axios.get(`/api/settings?name=faqCategories`);
        setFaqCategories(response.data.value);
      } catch (error) {}
    };
    const fetchAllSettings = async () => {
      setIsLoading(true);
      await getAllProducts();
      await getFeaturedProduct();
      await getAdminMobile();
      await getAdminEmail();
      await getSmsCost();
      await getStripeProcessingFee();
      await getAllFaqCategories();
      setIsLoading(false);
    };
    fetchAllSettings();
  }, []);

  const saveSettings = async () => {
    setIsLoading(true);
    await axios.put('/api/settings', {
      name: 'featuredProductId',
      value: featuredProductId,
    });
    await axios.put('/api/settings', {
      name: 'adminMobile',
      value: adminMobile,
    });
    await axios.put('/api/settings', {
      name: 'adminEmail',
      value: adminEmail,
    });
    await axios.put('/api/settings', {
      name: 'smsCost',
      value: smsCost,
    });
    await axios.put('/api/settings', {
      name: 'stripeProcessingFee',
      value: stripeProcessingFee,
    });
    await axios.put('/api/settings', {
      name: 'faqCategories',
      value: faqCategories,
    });
    setIsLoading(false);
    await MySwal.fire({
      title: 'Settings saved!',
      icon: 'success',
      confirmButtonColor: '#5390FF',
    });
  };
  

  

  const addFaqCategory = () => {
    setFaqCategories((prev) => [...prev, { category: '', faqs: [] }]);
  };
  const handleFaqCategoryChange = (value, index) => {
    setFaqCategories((prev) => {
      const newFaqCategories = [...prev];
      newFaqCategories[index].category = value;
      return newFaqCategories;
    });
  };
  const removeFaqCategory = (index) => {
    setFaqCategories((prev) => {
      const newFaqCategories = [...prev];
      newFaqCategories.splice(index, 1);
      return newFaqCategories;
    });
  };
  const handleCategoryLogo = (value, index) => {
    setFaqCategories((prev) => {
      const newFaqCategories = [...prev];
      newFaqCategories[index].logo = value;
      return newFaqCategories;
    });
  }
  const addFaq = (categoryIndex) => {
    console.log('addFaq');
    setFaqCategories((prev) => {
      let newFaqCategories = [...prev];
      newFaqCategories[categoryIndex] = {
        ...newFaqCategories[categoryIndex],
        faqs: [
          ...newFaqCategories[categoryIndex].faqs,
          { question: '', answer: '' },
        ],
      };
      return newFaqCategories;
    });
  };
  const handleFaqQuestionChange = (value, categoryIndex, questionIndex) => {
    setFaqCategories((prev) => {
      const newFaqCategories = [...prev];
      newFaqCategories[categoryIndex].faqs[questionIndex].question = value;
      return newFaqCategories;
    });
  };
  const removeFaq = (categoryIndex, questionIndex) => {
    setFaqCategories((prev) => {
      const newFaqCategories = [...prev];
      newFaqCategories[categoryIndex].faqs.splice(questionIndex, 1);
      return newFaqCategories;
    });
  };
  const handleFaqAnswerChange = (value, categoryIndex, questionIndex) => {
    setFaqCategories((prev) => {
      const newFaqCategories = [...prev];
      newFaqCategories[categoryIndex].faqs[questionIndex].answer = value;
      return newFaqCategories;
    });
  };
  return (
    <Layout>
      <h1>Settings</h1>

      {isLoading && (
        <div className='p-5'>
          <Spinnerdots fullWidth />
        </div>
      )}
      {!isLoading && (
        <>
          <label>Featured product</label>
          <select
            value={featuredProductId}
            onChange={(e) => setFeaturedProductId(e.target.value)}
          >
            {products.length > 0 &&
              products.map((product) => (
                <option key={product._id} value={product._id}>
                  {product.title}
                </option>
              ))}
          </select>
          <label>Admin Mobile Number</label>
          <input
            type='text'
            value={adminMobile}
            onChange={(e) => setAdminMobile(e.target.value)}
          />
          <label>Admin Email</label>
          <input
            type='text'
            value={adminEmail}
            onChange={(e) => setAdminEmail(e.target.value)}
          />
          <label>SMS Cost</label>
          <input
            type='text'
            value={smsCost}
            onChange={(e) => setSmsCost(e.target.value)}
          />
          <label>Stripe Charges (in %)(Format : Fee%+Tax%)</label>
          <input
            type='text'
            value={stripeProcessingFee}
            onChange={(e) => setStripeProcessingFee(e.target.value)}
          />
          
         
         
          <div className='my-2 bg-gray-300 rounded-md p-2'>
            <div className='flex justify-between items-center'>
              <label className='block mb-1'>FAQs</label>
              <button
                type='button'
                onClick={() => {
                  setShowFaqs((prev) => !prev);
                }}
              >
                {showFaqs ? (
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
                      d='M6 18L18 6M6 6l12 12'
                    />
                  </svg>
                ) : (
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
                      d='M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5'
                    />
                  </svg>
                )}
              </button>
            </div>
            {showFaqs && (
              <>
                <button
                  type='button'
                  onClick={addFaqCategory}
                  className='btn-default text-sm mb-2'
                >
                  Add FAQ Category
                </button>
                {faqCategories.length > 0 &&
                  faqCategories.map((faqCategory, i) => (
                    <div key={i} className='flex flex-col mb-2 bg-bgGray p-4'>
                      <div className='flex gap-1 mb-2'>
                        <input
                          type='text'
                          className='mb-0'
                          placeholder='Category Name'
                          value={faqCategory.category}
                          onChange={(e) =>
                            handleFaqCategoryChange(e.target.value, i)
                          }
                        />
                        <button
                          type='button'
                          onClick={() => removeFaqCategory(i)}
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
                        className='mb-0'
                        placeholder='Logo Name'
                        value={faqCategory.logo}
                        onChange={(e) =>
                          handleCategoryLogo(e.target.value, i)
                        }
                      />
                      {faqCategory.faqs.length > 0 &&
                        faqCategory.faqs.map((faq, j) => (
                          <div
                            key={j}
                            className='flex flex-col mb-2 bg-bgGray p-4'
                          >
                            <div className='flex gap-1 mb-2'>
                              <input
                                type='text'
                                className='mb-0'
                                placeholder='Question'
                                value={faq.question}
                                onChange={(e) =>
                                  handleFaqQuestionChange(e.target.value, i, j)
                                }
                              />
                              <button
                                type='button'
                                onClick={() => removeFaq(i, j)}
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
                            <textarea
                              className='mb-0'
                              placeholder='Answer'
                              value={faq.answer}
                              onChange={(e) =>
                                handleFaqAnswerChange(e.target.value, i, j)
                              }
                            />
                          </div>
                        ))}
                      <button
                        type='button'
                        onClick={() => {
                          
                          addFaq(i);
                        }}
                        className='btn-default text-sm mb-2'
                      >
                        Add FAQ
                      </button>
                    </div>
                  ))}
              </>
            )}
          </div>
          <div>
            <button onClick={saveSettings} className='btn-primary'>
              Save settings
            </button>
          </div>
        </>
      )}
    </Layout>
  );
};

export default SettingsPage;
