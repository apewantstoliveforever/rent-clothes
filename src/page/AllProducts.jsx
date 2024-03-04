import React, { useEffect, useState } from 'react';
import ReactDOMServer from 'react-dom/server';
import Modal from 'react-modal';
import { getDatabase, ref, onValue } from "firebase/database";
import { deleteDoc, onSnapshot, collection, getDocs, updateDoc, doc, addDoc, query, where } from "firebase/firestore";
import { firestore } from '../service/firebase';

Modal.setAppElement('#root');

const AllProducts = () => {
  const [clothes, setClothes] = useState([]);
  const database = getDatabase();
  const [chosenClothes, setChosenClothes] = useState([]);



  const [genderFilter, setGenderFilter] = useState('');
  const [sizeFilter, setSizeFilter] = useState('');


  const handleFilter = async (type, value) => {
    console.log(type, value);
    // const updatedFilters = { ...filters, [type]: value };
    // setFilters(updatedFilters);
    if (type === 'genderFilter') {
      setGenderFilter(value);
      console.log(genderFilter)
    } else if (type === 'sizeFilter') {
      setSizeFilter(value);
      console.log(sizeFilter)
    }
    console.log(genderFilter, sizeFilter);
  };



  useEffect(() => {
    const unsubscribe = onSnapshot(collection(firestore, 'clothes'), (snapshot) => {
      const clothesData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setClothes(clothesData);
    });
    // const fetchClothes = async () => {
    //   const items = await addClothingItem(); // Await the result of addClothingItem
    //   setClothes(items);
    // };
    // fetchClothes();
    return () => unsubscribe();
  }, []);


  const findAllClothes = async () => {
    const clothesRef = ref(database, 'clothes');
    onValue(clothesRef, (snapshot) => {
      const data = snapshot.val();
      console.log(data);
    });
  };

  useEffect(() => {
    setCountChosenClothes(chosenClothes.length);
  }, [chosenClothes]);

  useEffect(() => {
    findAllClothes();
  }, []);

  return (
    <div>
      <h1>Order</h1>
      <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd' }}>
        <thead>
          <tr>
            <th>Image</th>
            <th>Brand</th>
            <th>Color</th>
            <th>Type</th>
            <th>Rental Fee</th>
            <th>Size</th>
            <th>Gender</th>
            <th>Action</th>
          </tr>
          <tr>
            <td colSpan="6" style={{ backgroundColor: '#f2f2f2', padding: '5px' }}>
              <strong>Filter:</strong>&nbsp;
              Gender:
              <select onChange={(e) => handleFilter('genderFilter', e.target.value)}>
                <option value="">All</option>
                <option value="Unisex">Unisex</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
              &nbsp;
              Size:
              <select onChange={(e) => handleFilter('sizeFilter', e.target.value)}>
                <option value="">All</option>
                <option value="S">S</option>
                <option value="M">M</option>
                <option value="L">L</option>
                <option value="XL">XL</option>
              </select>
            </td>
          </tr>
        </thead>
        <tbody>
          {clothes.map((cloth) => (
            <tr row={`row-${cloth.id}`} key={cloth.id} style={{ borderBottom: '1px solid #ddd' }}>
              <td><img src={cloth.imageUrl} alt={cloth.Type} style={{ width: '100px' }} /></td>
              <td>{cloth.Brand}</td>
              <td>{cloth.Color}</td>
              <td>{cloth.Type}</td>
              <td>{cloth.RentalFee} đồng</td>
              <td>{cloth.Size}</td>
              <td>{cloth.Gender}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AllProducts;
