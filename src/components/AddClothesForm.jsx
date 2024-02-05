import React, { useState } from 'react';
import { uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { firestore } from '../service/firebase';
import { getStorage, ref } from "firebase/storage";

const AddClothesForm = ({ addNewCLothes }) => {
    const [clothesData, setClothesData] = useState({
        Brand: '',
        Type: '',
        Size: '',
        RentalFee: '',
        Available: true,
        Image: '',
        Gender: ''
    });



    const [image, setImage] = useState('');

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setImage(file);
    };


    const handleChange = (e) => {
        const { name, value } = e.target;
        setClothesData((prevData) => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        const storage = getStorage();
        const storageRef = ref(storage, 'clothes/'); // Add trailing slash
        const imageRef = ref(storageRef, image.name);

        // Upload the image to Firebase Storage
        const uploadTask = uploadBytesResumable(imageRef, image);

        uploadTask.on('state_changed',
            (snapshot) => {
                // Observe state change events such as progress, pause, and resume
            },
            (error) => {
                // Handle unsuccessful uploads
            },
            () => {
                // Handle successful uploads on complete
                getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                    console.log('File available at', downloadURL);
                    setClothesData((prevData) => ({
                        ...prevData,
                        Image: downloadURL
                    }));
                });
            }
        );
        
        // Update the clothesData with the image URL
        // setClothesData((prevData) => ({
        //     ...prevData,
        //     // Image: imageUrl
        // }));

        e.preventDefault();
        addNewCLothes(clothesData);
    };

    return (
        <div style={{ textAlign: 'center', margin: '20px' }}>
            <h2>Add Clothes</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <label style={{ margin: '5px' }}>
                    Image:
                    <input type="file" name="Image" onChange={handleImageChange} />
                </label>
                <label style={{ margin: '5px' }}>
                    Brand:
                    <input type="text" name="Brand" value={clothesData.Brand} onChange={handleChange} />
                </label>
                <br />
                <label style={{ margin: '5px' }}>
                    Type:
                    <input type="text" name="Type" value={clothesData.Type} onChange={handleChange} />
                </label>
                <br />
                <label style={{ margin: '5px' }}>
                    Size:
                    <input type="text" name="Size" value={clothesData.Size} onChange={handleChange} />
                </label>
                <br />
                <label style={{ margin: '5px' }}>
                    Rental Fee:
                    <input type="text" name="RentalFee" value={clothesData.RentalFee} onChange={handleChange} />
                </label>
                <br />
                <label style={{ margin: '5px' }}>
                    Available:
                    <input type="checkbox" name="Available" checked={clothesData.Available} onChange={handleChange} />
                </label>
                <br />
                <label style={{ margin: '5px' }}>
                    Gender:
                    <select name="Gender" value={clothesData.Gender} onChange={handleChange} style={{ padding: '5px' }}>
                        <option value="Unisex">Unisex</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                    </select>
                </label>
                <br />
                <button type="submit" style={{ padding: '10px', marginTop: '10px' }}>Add Clothes</button>
            </form>
        </div>
    );
};

export default AddClothesForm;
