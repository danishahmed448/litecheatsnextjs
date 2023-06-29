import axios from 'axios';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Spinner from './Spinner';
import { ReactSortable } from 'react-sortablejs';
import Spinnerdots from './Spinnerdots';
import SeperateItem from './SeperateItem';
import dynamic from 'next/dynamic';
const QuillNoSSRWrapper = dynamic(
  () => import('react-quill'), // replace 'react-quill' with the path to your component
  { ssr: false }
);
const modules = {
  toolbar: [
    ['bold', 'italic', 'underline', 'strike'], // text formatting
    ['blockquote', 'code-block'], // blocks
    [{ header: 1 }, { header: 2 }], // headers
    [{ list: 'ordered' }, { list: 'bullet' }], // lists
    [{ script: 'sub' }, { script: 'super' }], // superscript/subscript
    [{ indent: '-1' }, { indent: '+1' }], // outdent/indent
    [{ direction: 'rtl' }], // text direction
    [{ size: ['small', false, 'large', 'huge'] }], // text size
    [{ header: [1, 2, 3, 4, 5, 6, false] }], // header levels
    [{ color: [] }, { background: [] }], // text/background color
    [{ font: [] }], // font
    [{ align: [] }], // text align
    ['clean'], // remove formatting
    ['link', 'image', 'video'], // links, images, videos
  ],
};
import 'react-quill/dist/quill.snow.css'; // import styles
const ProductForm = ({
  _id,
  title: existingTitle,
  description: existingDescription,
  price: existingPrice,
  images: existingImages,
  category: existingCategory,
  properties: existingProperties,
  stock: existingStock,
  tags: existingTags,
  downloads: existingDownloads,
  typeOfProduct: existingTypeOfProduct,
  tutorial: existingTutorial,
  keyList: existingKeyList,
  secret: existingSecret,
}) => {
  const [title, setTitle] = useState(existingTitle || '');
  const [description, setDescription] = useState(existingDescription || '');
  const [price, setPrice] = useState(existingPrice || '');
  const [images, setImages] = useState(existingImages || []);
  const [category, setCategory] = useState(existingCategory || '');
  const [productProperties, setProductProperties] = useState(
    existingProperties || {}
  );
  const [stock, setStock] = useState(existingStock || 0);
  const [goToProducts, setGoToProducts] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setcategoriesLoading] = useState(false);
  const [tags, setTags] = useState(existingTags?.join(',') || '');

  const [typeOfProduct, setTypeOfProduct] = useState(
    existingTypeOfProduct || ''
  );
  const [tutorial, setTutorial] = useState(existingTutorial || '');
  const [keyList, setKeyList] = useState(existingKeyList || []);
  const [downloads, setDownloads] = useState(
    existingDownloads || [{ name: '', link: '', version: '', changelog: '' }]
  );
  const [secret, setSecret] = useState(existingSecret || '');
  const [showDownloads, setShowDownloads] = useState(false);
  const [showKeys, setShowKeys] = useState(false);
  const router = useRouter();
  useEffect(() => {
    const getAllCategories = async () => {
      try {
        setcategoriesLoading(true);
        const response = await axios.get('/api/categories');
        setCategories(response.data);
        setcategoriesLoading(false);
      } catch (error) {
        console.log(error);
      }
    };
    getAllCategories();
  }, []);
  const saveProduct = async (e) => {
    e.preventDefault();
    let data = {};
    if (typeOfProduct === 'SecretBased') {
      data = {
        title,
        description,
        price,
        images,
        category,
        properties: productProperties,
        tags: tags.split(',').map((tag) => tag.trim()),
        stock,
        downloads,
        tutorial,
        secret,
        typeOfProduct,
      };
    } else if (typeOfProduct === 'KeyBased') {
      data = {
        title,
        description,
        images,
        price,
        category,
        properties: productProperties,
        tags: tags.split(',').map((tag) => tag.trim()),
        downloads,
        tutorial,
        keyList: keyList,
        secret,
        typeOfProduct,
      };
    }

    if (_id) {
      await axios.put('/api/products', { ...data, _id });
    } else {
      await axios.post('/api/products', data);
    }
    setGoToProducts(true);
  };
  if (goToProducts) {
    router.push('/products');
  }
  const uploadImages = async (e) => {
    const files = e.target.files;
    if (files?.length > 0) {
      setIsUploading(true);
      const data = new FormData();
      for (const file of files) {
        data.append('file', file);
      }
      const res = await axios.post('/api/upload', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setImages((oldImages) => {
        return [...res.data, ...oldImages];
      });
      setIsUploading(false);
    }
  };
  const deleteImage = async (url) => {
    try {
      const publicId = url.split('/').pop().split('.').shift();
      const response = await axios.delete(`/api/upload?publicId=${publicId}`);

      // Check if the deletion was successful
      if (response.status === 200) {
        setImages((oldImages) => {
          return oldImages.filter((oldImage) => oldImage !== url);
        });
      } else {
        console.error('Failed to delete image');
        // You can also display an error message to the user here, if needed.
      }
    } catch (error) {
      console.error(error);
      // You can also display an error message to the user here, if needed.
    }
  };
  const setProductProp = (propName, value) => {
    setProductProperties((prev) => {
      const newProductProps = { ...prev };
      newProductProps[propName] = value;
      return newProductProps;
    });
  };

  const addDownload = (e) => {
    e.preventDefault();
    setDownloads([
      ...downloads,
      { name: '', link: '', version: '', changelog: '' },
    ]);
  };

  const removeDownload = (index) => {
    setDownloads([...downloads.slice(0, index), ...downloads.slice(index + 1)]);
  };
  const propertiesToFill = [];
  if (categories.length > 0 && category) {
    let catInfo = categories.find(({ _id }) => _id === category);
    propertiesToFill.push(...catInfo.properties);
    while (catInfo?.parent?._id) {
      const parentCat = categories.find(
        ({ _id }) => _id === catInfo?.parent?._id
      );
      propertiesToFill.push(...parentCat.properties);
      catInfo = parentCat;
    }
  }
  return (
    <form onSubmit={saveProduct} className='bg-white p-4 rounded-sm'>
      <label>Product name</label>
      <input
        type='text'
        placeholder='Product name'
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <label>Category</label>
      <select value={category} onChange={(e) => setCategory(e.target.value)}>
        <option value=''>Uncategorized</option>
        {categories.length > 0 &&
          categories.map((category) => (
            <option key={category._id} value={category._id}>
              {category.name}
            </option>
          ))}
      </select>
      {categoriesLoading && (
        <div className='p-5'>
          <Spinnerdots />
        </div>
      )}
      {propertiesToFill.length > 0 &&
        propertiesToFill.map((p, i) => (
          <div className='' key={i}>
            <label>{p.name[0].toUpperCase() + p.name.substring(1)}</label>
            <div>
              <select
                value={productProperties[p.name]}
                onChange={(e) => setProductProp(p.name, e.target.value)}
              >
                <option value=''>Not selected</option>
                {p.values.map((v, i) => (
                  <option value={v} key={i}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ))}
      <label>Photos</label>
      <div className='mb-2'>
        <div className='flex flex-row gap-2 flex-wrap'>
          {isUploading && (
            <div className='relative w-24 h-24 mt-2 rounded-sm flex items-center justify-center'>
              <Spinner />
            </div>
          )}
          {!images?.length > 0 ? (
            <></>
          ) : (
            <ReactSortable
              list={images}
              setList={setImages}
              className='flex flex-row flex-wrap gap-2'
            >
              {images.map((image) => (
                <div
                  key={image}
                  className='relative w-24 h-24 bg-white border border-gray-200 mt-2 rounded-sm cursor-move p-4 shadow-sm'
                >
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
              ))}
            </ReactSortable>
          )}
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
            <div>Add images</div>
            <input
              multiple
              type='file'
              className='hidden'
              onChange={uploadImages}
            />
          </label>
        </div>
      </div>
      <label>Description</label>
      <textarea
        placeholder='description'
        rows={7}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <label>Tags</label>
      <input
        type='text'
        placeholder='tags'
        value={tags}
        onChange={(e) => setTags(e.target.value)}
      />

      <SeperateItem
        name={'Downloads'}
        setShowState={setShowDownloads}
        showState={showDownloads}
        add={addDownload}
      >
        {downloads.length > 0 &&
          downloads.map((download, index) => (
            <div key={index} className='flex flex-col mb-2 bg-bgGray p-4'>
              <div className='flex gap-1 mb-2'>
                <input
                  type='text'
                  className='mb-0'
                  placeholder='Download Name'
                  value={download.name}
                  onChange={(e) => {
                    const newDownloads = [...downloads];
                    newDownloads[index].name = e.target.value;
                    setDownloads(newDownloads);
                  }}
                />
                <button
                  type='button'
                  onClick={(e) => {
                    e.preventDefault();
                    removeDownload(index);
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
                placeholder='Download Link'
                value={download.link}
                onChange={(e) => {
                  const newDownloads = [...downloads];
                  newDownloads[index].link = e.target.value;
                  setDownloads(newDownloads);
                }}
              />
              <input
                type='text'
                placeholder='Version'
                value={download.version}
                onChange={(e) => {
                  const newDownloads = [...downloads];
                  newDownloads[index].version = e.target.value;
                  setDownloads(newDownloads);
                }}
              />
              <textarea
                rows={7}
                placeholder='Changelog (Separated by commas)'
                value={download.changelog}
                onChange={(e) => {
                  const newDownloads = [...downloads];
                  newDownloads[index].changelog = e.target.value;
                  setDownloads(newDownloads);
                }}
              />
            </div>
          ))}
      </SeperateItem>

      <label>Tutorial{' (in HTML)'}</label>
      <QuillNoSSRWrapper
        className=''
        theme='snow'
        value={tutorial}
        modules={modules}
        onChange={setTutorial}
      />

      <label>Secret</label>
      <input
        type='text'
        placeholder='secret'
        value={secret}
        onChange={(e) => setSecret(e.target.value)}
      />
       <label>Price</label>
      <input
        type='number'
        placeholder='Price'
        value={price}
        onChange={(e) => setPrice(e.target.value)}
      />
      <label>Type of Product</label>
      <select
        value={typeOfProduct}
        onChange={(e) => setTypeOfProduct(e.target.value)}
      >
        <option value=''>Select product type</option>
        <option value='KeyBased'>Key Based</option>
        <option value='SecretBased'>Secret Based</option>
      </select>
     
      {typeOfProduct === 'SecretBased' && (
        <>
          <label>Stock</label>
          <input
            type='number'
            placeholder='Stock'
            value={stock}
            onChange={(e) => setStock(e.target.value)}
          />
        </>
      )}

      {typeOfProduct === 'KeyBased' && (
        <>
          <label className='block mb-1'>Keys</label>
          <div className='my-2 bg-gray-300 rounded-md p-2'>
            <div className='flex justify-between items-center'>
              <div className='flex flex-col mb-2 bg-bgGray p-0'>
                <textarea
                  className='mb-0'
                  placeholder='Key List (one per line)'
                  value={keyList.join('\n')}
                  rows={7}
                  cols={5000}
                  onChange={(e) => {
                    setKeyList(e.target.value.split('\n'));
                  }}
                />
              </div>
            </div>
          </div>
        </>
      )}

      <button type='submit' className='btn-primary'>
        Save
      </button>
    </form>
  );
};

export default ProductForm;
