import Spinnerdots from '@/components/Spinnerdots';
import axios from 'axios';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);
const { default: Layout } = require('@/components/Layout');

const Categories = () => {
  const [editedCategory, setEditedCategory] = useState(null);
  const [name, setName] = useState('');
  const [categories, setCategories] = useState([]);
  const [parentCategory, setParentCategory] = useState('');
  const [properties, setProperties] = useState([]);
  const [loading, setloading] = useState(false);
  const getAllCategories = async () => {
    try {
      setloading(true);
      const response = await axios.get('/api/categories');
      if(response.data){

        setCategories(response.data);
      }
      setloading(false);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getAllCategories();
  }, []);

  const saveCategory = async (e) => {
    e.preventDefault();
    const data = {
      name,
      parentCategory,
      properties: properties.map((property) => ({
        name: property.name,
        values: property.values.split(','),
      })),
    };
    if (editedCategory) {
      data._id = editedCategory._id;
      await axios.put('/api/categories', data);
      setEditedCategory(null);
    } else {
      await axios.post('/api/categories', data);
    }
    setName('');
    setParentCategory('');
    setProperties([]);
    await getAllCategories();
  };

  const editCategory = (e, category) => {
    e.preventDefault();
    setEditedCategory(category);
    setName(category.name);
    setParentCategory(category?.parent?._id);
    setProperties(
      category.properties.map((property) => ({
        name: property.name,
        values: property.values.join(','),
      })) || []
    );
  };
  const deleteCategory = async (e, category) => {
    e.preventDefault();
    const result = await MySwal.fire({
      title: 'Are you sure?',
      text: `Do you want to delete ${category.name}?`,
      showCancelButton: true,
      cancelButtonText: 'No',
      confirmButtonText: 'Yes, Delete!',
      confirmButtonColor: '#d55',
      reverseButtons: true,
    });
    if (result.isConfirmed) {
      await axios.delete(`/api/categories?id=${category._id}`);
      await getAllCategories();
    }
  };
  const addProperty = () => {
    setProperties((prev) => {
      return [...prev, { name: '', values: '' }];
    });
  };
  const handlePropertyNameChange = (newName, index) => {
    setProperties((prev) => {
      let r = prev.map((property) => ({ ...property }));
      r[index].name = newName;
      return r;
    });
  };
  const handlePropertyValuesChange = (newValue, index) => {
    setProperties((prev) => {
      let r = prev.map((property) => ({ ...property }));
      r[index].values = newValue;
      return r;
    });
  };
  const removeProperty = (index) => {
    setProperties((prev) => prev.filter((property, i) => i !== index));
  };
  return (
    <Layout>
      <h1>Categories</h1>
      <label>
        {editedCategory
          ? `Edit category ${editedCategory.name}`
          : 'Create new category'}
      </label>
      <form onSubmit={saveCategory}>
        <div className='bg-white p-4 my-2'>
          <div className='flex gap-1 '>
            <input
              type='text'
              placeholder='Category name'
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <select
              value={parentCategory}
              onChange={(e) => setParentCategory(e.target.value)}
            >
              <option value=''>No parent category</option>
              {categories.length > 0 &&
                categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
            </select>
          </div>
          <div className='mb-2 bg-gray-300 rounded-md p-2'>
            <label className='block mb-1'>Properties</label>
            <button
              type='button'
              onClick={addProperty}
              className='btn-default text-sm mb-2'
            >
              Add new property
            </button>
            {properties.length > 0 &&
              properties.map((property, i) => (
                <div key={i} className='flex flex-col mb-2 bg-bgGray p-4'>
                  <div className='flex gap-1 mb-2'>
                    <input
                      type='text'
                      className='mb-0'
                      placeholder='property name (example:color)'
                      value={property.name}
                      onChange={(e) =>
                        handlePropertyNameChange(e.target.value, i)
                      }
                    />

                    <button
                      type='button'
                      onClick={() => removeProperty(i)}
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
                    type='text'
                    className='mb-0'
                    placeholder='values, comma separated'
                    value={property.values}
                    onChange={(e) =>
                      handlePropertyValuesChange(e.target.value, i)
                    }
                  />
                </div>
              ))}
          </div>
        </div>
        <div className='flex gap-1 my-2'>
          {editedCategory && (
            <button
              type='button'
              className='btn-default py-1'
              onClick={() => {
                setEditedCategory(null);
                setParentCategory('');
                setName('');
                setProperties([]);
              }}
            >
              Cancel
            </button>
          )}
          <button type='submit' className='btn-primary py-1'>
            Save
          </button>
        </div>
      </form>
      {!editedCategory && (
        <div className='table-container'>
          <table className='basic mt-2'>
            <thead>
              <tr>
                <td>Category Name</td>
                <td>Parent Category</td>
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
              {categories.length > 0 &&
                categories.map((category) => (
                  <tr key={category._id}>
                    <td>{category.name}</td>
                    <td>{category?.parent?.name}</td>
                    <td className='.button-cell'>
                      <Link
                        className='btn-default'
                        href={`#`}
                        onClick={(e) => editCategory(e, category)}
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
                            d='M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10'
                          />
                        </svg>
                        Edit
                      </Link>
                      <Link
                        href={`#`}
                        className='btn-red'
                        onClick={(e) => deleteCategory(e, category)}
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
      )}
    </Layout>
  );
};

export default Categories;
