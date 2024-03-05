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

        const [genderFilter, setGenderFilter] = useState('');
        const [sizeFilter, setSizeFilter] = useState('');

        const handleFilter = async (type, value) => {
            if (type === 'genderFilter') {
                setGenderFilter(value);
            } else if (type === 'sizeFilter') {
                setSizeFilter(value);
            }
        };

        useEffect(() => {
            const unsubscribe = onSnapshot(collection(firestore, 'clothes'), (snapshot) => {
                const clothesData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
                setClothes(clothesData);
            });
            return () => unsubscribe();
        }, []);

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

        return (
            <div>
                <h1>Tất cả quần áo có</h1>
                <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd' }}>
                    <thead>
                        <tr>
                            <th>Image</th>
                            <th>Brand</th>
                            <th>Color</th>
                            <th>Type</th>
                            <th>Rental Fee</th>
                            <th>Deposit</th>
                            <th>Size</th>
                            {/* <th>Gender</th> */}
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
                                <td>{cloth.Deposit} đồng</td>
                                <td>{cloth.Size}</td>
                                {/* <td>{cloth.Gender}</td> */}
                                <td>
                                    <button onClick={() => handleEdit(cloth.id)}>Edit</button>
                                    <button onClick={() => handleDelete(cloth.id)}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <Modal isOpen={isModalOpen} onRequestClose={() => setIsModalOpen(false)}> {/* Close modal when requested */}
                    {/* Here you can render the form for editing */}
                    {editingItemId && (
                        <form onSubmit={handleSubmit}>
                            <label htmlFor="brand">Brand:</label>
                            <input type="text" id="brand" value={editedItem.Brand} onChange={(e) => setEditedItem({ ...editedItem, Brand: e.target.value })} />

                            <label htmlFor="color">Color:</label>
                            <select name="Color" value={editedItem.Color} onChange={(e) => setEditedItem({ ...editedItem, Color: e.target.value })}>
                                <option value="Red">Red</option>
                                <option value="Blue">Blue</option>
                                <option value="Green">Green</option>
                                <option value="Yellow">Yellow</option>
                                <option value="Black">Black</option>
                                <option value="White">White</option>
                                <option value="Grey">Grey</option>
                                <option value="Brown">Brown</option>
                                <option value="Purple">Purple</option>
                                <option value="Pink">Pink</option>
                                <option value="Orange">Orange</option>
                                <option value="Cyan">Cyan</option>
                                <option value="Magenta">Magenta</option>
                                <option value="Lime">Lime</option>
                                <option value="Teal">Teal</option>
                                <option value="Indigo">Indigo</option>
                                <option value="Violet">Violet</option>
                                <option value="Fuchsia">Fuchsia</option>
                                <option value="Gold">Gold</option>
                                <option value="Silver">Silver</option>
                                <option value="Bronze">Bronze</option>
                                <option value="Other">Khác</option>
                            </select>

                            <label htmlFor="type">Type:</label>
                            <input type="text" id="type" value={editedItem.Type} onChange={(e) => setEditedItem({ ...editedItem, Type: e.target.value })} />

                            <label htmlFor="rentalFee">Rental Fee:</label>
                            <input type="number" id="rentalFee" value={editedItem.RentalFee} onChange={(e) => setEditedItem({ ...editedItem, RentalFee: e.target.value })} />

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
