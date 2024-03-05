//HomePage.jsx

import React, { Component } from 'react';
import { useState, useEffect } from 'react';
import { auth, firestore } from '../service/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { addDoc, collection } from 'firebase/firestore';

import Bill from './Bill';
import DashBoard from './DashBoard';
import Order from './Order';
import AllProducts from './AllProducts';


const HomePage = () => {
    const [user, setUser] = useState(null);
    const [selectedTab, setSelectedTab] = useState('home');

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

    const signIn = async () => {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, 'ssss93dddda3s3@gmail.com', 'ssss2233323');
            const user = userCredential.user;
            console.log(user);
        }
        catch (error) {
            console.error(error.message);
        }
    };

    const signOut = () => {
        auth.signOut();
    };

    const createNewUser = async () => {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, 'ssss93dddda3s3@gmail.com', 'ssss2233323');
            const user = userCredential.user;
            console.log(user);
        }
        catch (error) {
            console.error(error.message);
        }
    }

    // Function to add a clothing item to Firestore
    const addClothingItem = async (clothingData) => {
        try {
            const clothesCollection = collection(firestore, 'clothes');

            // Add the clothing item to the "clothes" collection
            const newClothingItemRef = await addDoc(clothesCollection, clothingData);

            console.log('Clothing item added with ID: ', newClothingItemRef.id);
            return newClothingItemRef.id;
        } catch (error) {
            console.error('Error adding clothing item: ', error.message);
        }
    };

    // Example data for a clothing item
    const clothingItemData = {
        name: 'T-shirt',
        price: 20.99,
        size: 'M',
        gender: 'Male',
        rent_address: '123 Main St, Anytown, USA',
        renter: 'John Doe',
        date: new Date(),
        rented: false,
    };


    return (
        <div>
            <div>
                {user ? (
                    <div>
                        <p>Welcome, {user.email}!</p>
                        <button onClick={signOut}>Sign Out</button>
                    </div>
                ) : (
                    <div>
                        <p>Please sign in to continue.</p>
                        <button onClick={signIn}>Sign In</button>
                    </div>
                )}
                <h1>Kalynn shop</h1>
                {/* <div>
                    <button onClick={createNewUser}>Create New User</button>
                </div> */}
            </div>
            {/* addtab to render different component */}
            <div>
                <button onClick={() => setSelectedTab('home')}>Home</button>
                <button onClick={() => setSelectedTab('order')}>Đặt hàng</button>
                <button onClick={() => setSelectedTab('dashboard')}>Thêm hàng</button>
                <button onClick={() => setSelectedTab('bill')}>Trả hàng</button>
                <button onClick={() => setSelectedTab('all-products')}>Thay đổi, xóa hàng</button>
            </div>
            {
                selectedTab === 'home' && <h1>Home</h1>
            }
            {
                selectedTab === 'order' && <Order />
            }
            {
                selectedTab === 'dashboard' && <DashBoard />
            }
            {
                selectedTab === 'bill' && <Bill />
            }
            {
                selectedTab === 'all-products' && <AllProducts />
            }
        </div>
    );
}

export default HomePage;