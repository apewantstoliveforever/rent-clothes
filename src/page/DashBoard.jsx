import React, { Component } from 'react';
import { useState, useEffect } from 'react';
import { auth, firestore } from '../service/firebase';
import AddClothesForm from '../components/AddClothesForm';
import { addDoc, collection } from 'firebase/firestore';
import { uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { getStorage, ref } from "firebase/storage";


const DashBoard = () => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((authUser) => {
            if (authUser) {
                setUser(authUser);
            } else {
                setUser(null);
            }
        });

        return () => {
            unsubscribe();
        };
    }, []);

    const handleAddClothes = async (clothesData) => {
        console.log('Clothes data:', clothesData);
        addClothingItem(clothesData);
    };

    // Function to add multiple clothing items to Firestore
    const addClothingItem = async (clothingData) => {
        try {
            const clothesCollection = collection(firestore, 'clothes');

            const newClothingItemRef = await Promise.all(clothingData.map(async (item) => {
                //send image to storage and get the url
                const storage = getStorage();
                const storageRef = ref(storage, 'clothes/'); // Add trailing slash
                const imageRef = ref(storageRef, item.image.name);
                const uploadTask = uploadBytesResumable(imageRef, item.image);
                uploadTask.on('state_changed',
                    (snapshot) => {
                        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                        console.log('Upload is ' + progress + '% done');
                        switch (snapshot.state) {
                            case 'paused':
                                console.log('Upload is paused');
                                break;
                            case 'running':
                                console.log('Upload is running');
                                break;
                        }
                    },
                    (error) => {
                        console.error('Error uploading image:', error.message);
                    },
                    () => {
                        // Handle successful uploads on complete
                        getDownloadURL(uploadTask.snapshot.ref).then(async (downloadURL) => {
                            console.log('File available at', downloadURL);
                            item.imageUrl = downloadURL;
                            //remove image from item
                            const newCloth = {
                                Brand: item.Brand,
                                Color: item.Color,
                                Type: item.Type,
                                Size: item.Size,
                                Gender: item.Gender,
                                RentalFee: item.RentalFee,
                                Deposit: item.Deposit,
                                Available: item.Available,
                                imageUrl: item.imageUrl,
                                Available: true,
                            }
                            const newClothingItemRef = await addDoc(clothesCollection, newCloth);
                        });
                        // console.log('Clothing item added with ID: ', newClothingItemRef.id);
                        // return newClothingItemRef.id;
                    }
                );
            }));
        } catch (error) {
            console.error('Error adding clothing item: ', error.message);
        }
    };

    return (
        <div>
            <h1>Dashboard</h1>
            <p>Welcome {user?.email}</p>
            <AddClothesForm addNewClothes={handleAddClothes} />
        </div>
    );
}

export default DashBoard;