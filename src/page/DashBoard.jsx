import React, { Component } from 'react';
import { useState, useEffect } from 'react';
import { auth, firestore } from '../service/firebase';
import AddClothesForm from '../components/AddClothesForm';


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
    };

    return (
        <div>
            <h1>Dashboard</h1>
            <p>Welcome {user?.email}</p>
            <AddClothesForm addNewCLothes={handleAddClothes}/>
        </div>
    );
}

export default DashBoard;