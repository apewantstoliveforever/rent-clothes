import React, { useState } from 'react';

const Item = ({ onImageChange, onInputChange, item }) => {
    return (
        <form style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
            <label style={{ margin: '5px' }}>
                Image:
                <input type="file" name="Image" onChange={onImageChange} />
            </label>
            <label style={{ margin: '5px' }}>
                {/* Display image preview */}
                {item.image && <img src={URL.createObjectURL(item.image)} alt="image" style={{ maxWidth: '80px', maxHeight: '80px' }} />}
            </label>
            <label style={{ margin: '5px' }}>
                Brand:
                <input type="text" name="Brand" value={item.Brand} onChange={onInputChange} />
            </label>
            <label style={{ margin: '5px' }}>
                Type:
                <input type="text" name="Type" value={item.Type} onChange={onInputChange} />
            </label>
            <label style={{ margin: '5px' }}>
                Size:
                <select name="Size" value={item.Size} onChange={onInputChange} style={{ padding: '5px' }}>
                    <option value="XS">XS</option>
                    <option value="S">S</option>
                    <option value="M">M</option>
                    <option value="L">L</option>
                    <option value="XL">XL</option>
                    <option value="XXL">XXL</option>
                </select>
            </label>
            <label style={{ margin: '5px' }}>
                Gender
                <select name='Gender' value={item.Gender} onChange={onInputChange} style={{ padding: '5px' }}>
                    <option value='Unisex'>Unisex</option>
                    <option value='Male'>Male</option>
                    <option value='Female'>Female</option>
                </select>
            </label>
            <label style={{ margin: '5px' }}>
                Rental Fee:
                <input type="number" name="RentalFee" value={item.RentalFee} onChange={onInputChange} min="0" />
            </label>
        </form>
    );
};

const AddClothesForm = ({ addNewClothes }) => {
    const [items, setItems] = useState([{ Brand: '', Type: '', Size: 'XS', RentalFee: '', Available: true, Image: '', Gender: 'Unisex', InBillId: null, image: null }]);

    const handleImageChange = (index, e) => {
        const file = e.target.files[0];
        const newItems = [...items];
        newItems[index].image = file;
        setItems(newItems);
    };

    const handleInputChange = (index, e) => {
        const { name, value } = e.target;
        console.log(name, value);
        const newItems = [...items];
        // newItems[index][name] = value;
        //if its number, convert to number
        if (name && name === 'RentalFee') {
            newItems[index][name] = Number(value);
        }
        else {
            newItems[index][name] = value;
        }
        setItems(newItems);
        // console.log(items);
    };

    const handleAddMore = () => {
        setItems([...items, { Brand: '', Type: '', Size: 'XS', RentalFee: "", Available: true, Image: '', Gender: 'Unisex', InBillId: null, image: null }]);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        addNewClothes(items);
        // Reset items array
        setItems([{ Brand: '', Type: '', Size: 'XS', RentalFee: "", Available: true, Image: '', Gender: 'Unisex', InBillId: null, image: null }]);
    };

    return (
        <div>
            <h2>Add Clothes</h2>
            {items.map((item, index) => (
                <div key={index} style={{ textAlign: 'center', margin: '20px', border: '1px solid black', padding: '5px' }}>
                    <Item
                        item={item}
                        onImageChange={(e) => handleImageChange(index, e)}
                        onInputChange={(e) => handleInputChange(index, e)}
                    />
                </div>
            ))}
            <button onClick={handleAddMore}>Add more</button>
            <button type="submit" style={{ padding: '10px', marginTop: '10px' }} onClick={handleSubmit}> Add Clothes</button>
        </div>
    );
};

export default AddClothesForm;
