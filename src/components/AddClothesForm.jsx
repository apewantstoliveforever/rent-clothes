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
                Color:
                <select name="Color" value={item.Color} onChange={onInputChange} style={{ padding: '5px' }}>
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
                Deposit:
                <input type="number" name="Deposit" value={item.Deposit} onChange={onInputChange} min="0" />
            </label>
            {/* <label style={{ margin: '5px' }}>
                Gender
                <select name='Gender' value={item.Gender} onChange={onInputChange} style={{ padding: '5px' }}>
                    <option value='Unisex'>Unisex</option>
                    <option value='Male'>Male</option>
                    <option value='Female'>Female</option>
                </select>
            </label> */}
            <label style={{ margin: '5px' }}>
                Rental Fee:
                <input type="number" name="RentalFee" value={item.RentalFee} onChange={onInputChange} min="0" />
            </label>
        </form>
    );
};

const AddClothesForm = ({ addNewClothes }) => {
    const [items, setItems] = useState([{ Brand: '', Color:'Other', Deposit:'', Type: '', Size: 'XS', RentalFee: '', Available: true, Image: '', Gender: 'Unisex', InBillId: null, image: null }]);

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
        else if (name && name === 'Deposit') {
            newItems[index][name] = Number(value);
        }
        else {
            newItems[index][name] = value;
        }
        setItems(newItems);
        // console.log(items);
    };

    const handleAddMore = () => {
        setItems([...items, { Brand: '', Color:'Other', Deposit:'', Type: '', Size: 'XS', RentalFee: "", Available: true, Image: '', Gender: 'Unisex', InBillId: null, image: null }]);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        addNewClothes(items);
        // Reset items array
        setItems([{ Brand: '',  Deposit:'',  Color:'Other', Type: '', Size: 'XS', RentalFee: "", Available: true, Image: '', Gender: 'Unisex', InBillId: null, image: null }]);
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
                    <button onClick={() => setItems(items.filter((_, i) => i !== index))}>Xóa</button>
                </div>
            ))}
            <button onClick={handleAddMore}>Thêm</button>
            <button type="submit" style={{ padding: '10px', marginTop: '10px' }} onClick={handleSubmit}> Xác nhận thêm quần áo</button>
        </div>
    );
};

export default AddClothesForm;
