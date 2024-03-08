import React, { useEffect, useState } from 'react';
import ReactDOMServer from 'react-dom/server';
import Modal from 'react-modal';
import { getDatabase, ref, onValue, remove } from "firebase/database";
import { deleteDoc, onSnapshot, collection, getDocs, updateDoc, doc, addDoc, query, where } from "firebase/firestore";
import { firestore } from '../service/firebase';

Modal.setAppElement('#root');

const AllProducts = () => {
    const [clothes, setClothes] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItemId, setEditingItemId] = useState(null); // Track the ID of the item being edited
    const [editedItem, setEditedItem] = useState({ // Initialize editedItem state
        Brand: '',
        Color: '',
        Type: '',
        RentalFee: 0,
        Size: '',
        Deposit: 0,
    });
    const database = getDatabase();

    // const [genderFilter, setGenderFilter] = useState('');
    const [sizeFilter, setSizeFilter] = useState('');
    const [colorFilter, setcolorFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [kindFilter, setKindFilter] = useState('');

    const handleFilter = async (type, value) => {
        console.log(type, value);
        // const updatedFilters = { ...filters, [type]: value };
        // setFilters(updatedFilters);
        // if (type === 'genderFilter') {
        //   setGenderFilter(value);
        //   console.log(genderFilter)
        // } else 
        if (type === 'sizeFilter') {
            setSizeFilter(value);
            console.log(sizeFilter)
        }
        else if (type === 'colorFilter') {
            setcolorFilter(value);
            console.log('Color filter:', value);
        }
        else if (type === 'typeFilter') {
            setTypeFilter(value);
            console.log('Type filter:', value);
        }
        else if (type === 'kindFilter') {
            setKindFilter(value);
            console.log('Kind filter:', value);
        }

    };


    const findAllClothes = async () => {
        const clothesRef = ref(database, 'clothes');
        onValue(clothesRef, (snapshot) => {
            const data = snapshot.val();
            console.log(data);
        });
    };

    const handleEdit = (id) => {
        // Open the modal for editing
        setIsModalOpen(true);
        // Set the ID of the item being edited
        setEditingItemId(id);
        setEditedItem(clothes.find((item) => item.id === id));
        const item = clothes.find((item) => item.id === id);
        console.log(item);
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        // Handle form submission here
        console.log('Form submitted:', editedItem);
        // Add your update logic here
        console.log('Update product with id:', editingItemId);
        updateDoc(doc(firestore, 'clothes', editingItemId), editedItem);
        // Close the modal
        setIsModalOpen(false);
    };

    const handleDelete = (id) => {
        // Add your delete logic here
        console.log('Delete product with id:', id);
        deleteDoc(doc(firestore, 'clothes', id));
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

    useEffect(() => {
        console.log(sizeFilter, colorFilter);
        const fetchClothes = async () => {
            let q = collection(firestore, "clothes");

            if (sizeFilter !== '') {
                q = query(q, where("Size", "==", sizeFilter));
            }
            if (colorFilter !== '') {
                q = query(q, where("Color", "==", colorFilter));
            }
            if (typeFilter !== '') {
                q = query(q, where("Type", "==", typeFilter));
            }
            if (kindFilter !== '') {
                q = query(q, where("Kind", "==", kindFilter));
            }

            if (sizeFilter === '' && colorFilter === '' && typeFilter === '' && kindFilter === '') {
                q = collection(firestore, "clothes");
            }

            const querySnapshot = await getDocs(q);
            const clothesList = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            console.log(clothesList);
            setClothes(clothesList);
        };
        fetchClothes();
    }, [sizeFilter, colorFilter, typeFilter, kindFilter]);

    const resetFilters = () => {
        setSizeFilter('');
        setcolorFilter('');
        setTypeFilter('');
        setKindFilter('');
        //input to default value
        if (document.getElementById('sizeFilter') && document.getElementById('colorFilter') && document.getElementById('typeFilter')) {
            document.getElementById('sizeFilter').value = '';
            document.getElementById('colorFilter').value = '';
            document.getElementById('typeFilter').value = '';
            document.getElementById('kindFilter').value = '';
        }
    };


    return (
        <div>
            <h2>Thay đổi, xóa hàng</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd' }}>
                <thead>
                    <tr>
                        <th>Hình ảnh</th>
                        <th>Loại</th>
                        <th>Thương hiệu</th>
                        <th>Màu sắc</th>
                        <th>Hình dạng</th>
                        <th>Tiền cọc</th>
                        <th>Tiền thuê</th>
                        <th>Size</th>
                        {/* <th>Gender</th> */}
                        <th>Action</th>
                    </tr>
                    <tr>
                        <td colSpan="6" style={{ backgroundColor: '#f2f2f2', padding: '5px' }}>
                            <button style={{ backgroundColor: 'lightyellow' }} onClick={resetFilters}>Hiện tất cả</button>
                            <strong>Filter:</strong>&nbsp;

                            Loại:
                            <select id='kindFilter' name="Kind" onChange={(e) => handleFilter('kindFilter', e.target.value)}>
                                <option value="">All</option>
                                <option value="Quần áo">Quần áo</option>
                                <option value="Phụ kiện">Phụ kiện</option>
                                <option value="">Khác</option>
                            </select>
                            {/* Gender:
                                <select onChange={(e) => handleFilter('genderFilter', e.target.value)}>
                                    <option value="">All</option>
                                    <option value="Unisex">Unisex</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                </select>
                                &nbsp; */}
                            Size:
                            <select id='sizeFilter' onChange={(e) => handleFilter('sizeFilter', e.target.value)}>
                                <option value="">All</option>
                                <option value="S">S</option>
                                <option value="M">M</option>
                                <option value="L">L</option>
                                <option value="XL">XL</option>
                            </select>
                            &nbsp;
                            Màu sắc:
                            <select id='colorFilter' name="Color" onChange={(e) => handleFilter('colorFilter', e.target.value)}>
                                <option value="Khác">Khác</option>
                                <option value="Đỏ">Đỏ</option>
                                <option value="Trằng">Trắng</option>
                                <option value="Kem">Kem</option>
                                <option value="Đỏ">Đỏ</option>
                                <option value="Hồng">Hồng</option>
                                <option value="Váy Hoa">Váy Hoa</option>
                                <option value="Vàng">Vàng</option>
                            </select>
                            Dạng:
                            <input id="typeFilter" type="text" name="Type" onChange={(e) => handleFilter('typeFilter', e.target.value)} />
                        </td>
                    </tr>
                </thead>
                <tbody>
                    {clothes.map((cloth) => (
                        <tr row={`row-${cloth.id}`} key={cloth.id} style={{ borderBottom: '1px solid #ddd' }}>
                            <td><img src={cloth.imageUrl} alt={cloth.Type} style={{ width: '100px' }} /></td>
                            <td>{cloth.Kind}</td>
                            <td>{cloth.Brand}</td>
                            <td>{cloth.Color}</td>
                            <td>{cloth.Type}</td>
                            <td>{cloth.RentalFee} đồng</td>
                            <td>{cloth.Deposit} đồng</td>
                            <td>{cloth.Size}</td>
                            {/* <td>{cloth.Gender}</td> */}
                            <td>
                                <button onClick={() => handleEdit(cloth.id)}>Thay đổi</button>
                                <button style={{ backgroundColor: '#FF3333' }} onClick={() => handleDelete(cloth.id)}>Xóa</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <Modal isOpen={isModalOpen} onRequestClose={() => setIsModalOpen(false)}> {/* Close modal when requested */}
                {/* Here you can render the form for editing */}
                {editingItemId && (
                    <form onSubmit={handleSubmit}>
                        <label htmlFor="imageUrl">Loại:</label>
                        <select name="Kind" value={editedItem.Kind} onChange={(e) => setEditedItem({ ...editedItem, Kind: e.target.value })}>
                            <option value="Quần áo">Quần áo</option>
                            <option value="Phụ kiện">Phụ kiện</option>
                            <option value="">Khác</option>
                        </select>

                        <label htmlFor="brand">Thương hiệu:</label>
                        <input type="text" id="brand" value={editedItem.Brand} onChange={(e) => setEditedItem({ ...editedItem, Brand: e.target.value })} />



                        <label htmlFor="color">Màu sắc:</label>
                        <select name="Color" value={editedItem.Color} onChange={(e) => setEditedItem({ ...editedItem, Color: e.target.value })}>
                            <option value="Đỏ">Đỏ</option>
                            <option value="Trằng">Trắng</option>
                            <option value="Kem">Kem</option>
                            <option value="Đỏ">Đỏ</option>
                            <option value="Hồng">Hồng</option>
                            <option value="Váy Hoa">Váy Hoa</option>
                            <option value="Vàng">Vàng</option>
                            <option value="Khác">Khác</option>
                        </select>

                        <label htmlFor="type">Dạng:</label>
                        <input type="text" id="type" value={editedItem.Type} onChange={(e) => setEditedItem({ ...editedItem, Type: e.target.value })} />
                        <label htmlFor="deposit">Tiền cọc:</label>
                        <input type="number" id="deposit" value={editedItem.Deposit} onChange={(e) => setEditedItem({ ...editedItem, Deposit: Number(e.target.value) })} />
                        <label htmlFor="rentalFee">Tiền thuê:</label>
                        <input type="number" id="rentalFee" value={editedItem.RentalFee} onChange={(e) => setEditedItem({ ...editedItem, RentalFee: Number(e.target.value) })} />

                        <label htmlFor="size">Size:</label>
                        <select value={editedItem.Size} onChange={(e) => setEditedItem({ ...editedItem, Size: e.target.value })}>
                            <option value="">All</option>
                            <option value="S">S</option>
                            <option value="M">M</option>
                            <option value="L">L</option>
                            <option value="XL">XL</option>
                        </select>

                        <button type="submit">Save</button>
                        <button onClick={() => setIsModalOpen(false)}>Cancel</button>
                    </form>
                )}
            </Modal>
        </div>
    );
};

export default AllProducts;
