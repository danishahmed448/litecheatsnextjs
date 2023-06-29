import React, { useEffect, useState } from 'react';
import styles from '../styles/HomeStats.module.css';
import axios from 'axios';
import Spinnerdots from './Spinnerdots';
import { subHours } from 'date-fns';

const HomeStats = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setloading] = useState(false);
  useEffect(() => {
    const source = axios.CancelToken.source();
    const getAllOrders = async () => {
      setloading(true);
      try {
        const response = await axios.get('/api/orders', {
          cancelToken: source.token,
        });
        setOrders(response.data);
        setloading(false);
      } catch (error) {
        setloading(false);
        console.log(error);
      }
    };
    getAllOrders();

    return () => {
      source.cancel();
    };
  }, []);
if(loading){
    return (
        <div className='my-4'>
        <Spinnerdots fullWidth={true} />
      </div>
    )
}
const ordersToday = orders.filter((order) => (new Date(order.createdAt) > subHours(new Date(), 24)) && (order.paid));
const ordersWeek = orders.filter((order) => (new Date(order.createdAt) > subHours(new Date(), 24*7)) && (order.paid));
const ordersMonth = orders.filter((order) => (new Date(order.createdAt) > subHours(new Date(), 24*30)) && (order.paid));
const revenueToday = ordersToday.reduce((acc, order) => acc + Number(order.totalAmount), 0);
const revenueWeek = ordersWeek.reduce((acc, order) => acc + Number(order.totalAmount), 0);
const revenueMonth = ordersMonth.reduce((acc, order) => acc + Number(order.totalAmount), 0);
  return (
    <div className='flex flex-col gap-4 mt-4'>
      <h2>Orders</h2>
      <div className={styles.tiles_grid}>
        <div className={styles.tile}>
          <h3 className={styles.tile_header}>Today</h3>
          <div className={styles.tile_number}>{ordersToday.length}</div>
          <div className={styles.tile_desc}>{ordersToday.length} orders today</div>
        </div>
        <div className={styles.tile}>
          <h3 className={styles.tile_header}>This week</h3>
          <div className={styles.tile_number}>{ordersWeek.length}</div>
          <div className={styles.tile_desc}>{ordersWeek.length} orders this week</div>
        </div>
        <div className={styles.tile}>
          <h3 className={styles.tile_header}>This month</h3>
          <div className={styles.tile_number}>{ordersMonth.length}</div>
          <div className={styles.tile_desc}>{ordersMonth.length} orders this month</div>
        </div>
      </div>
      <h2>Revenue</h2>
      <div className={styles.tiles_grid}>
        <div className={styles.tile}>
          <h3 className={styles.tile_header}>Today</h3>
          <div className={styles.tile_number}>₹{new Intl.NumberFormat('en-IN').format(Math.floor(revenueToday))}</div>
          <div className={styles.tile_desc}>{ordersToday.length} orders today</div>
        </div>
        <div className={styles.tile}>
          <h3 className={styles.tile_header}>This week</h3>
          <div className={styles.tile_number}>₹{new Intl.NumberFormat('en-IN').format(Math.floor(revenueWeek))}</div>
          <div className={styles.tile_desc}>{ordersWeek.length} orders this week</div>
        </div>
        <div className={styles.tile}>
          <h3 className={styles.tile_header}>This month</h3>
          <div className={styles.tile_number}>₹{new Intl.NumberFormat('en-IN').format(Math.floor(revenueMonth))}</div>
          <div className={styles.tile_desc}>{ordersMonth.length} orders this month</div>
        </div>
      </div>
    </div>
  );
};

export default HomeStats;
