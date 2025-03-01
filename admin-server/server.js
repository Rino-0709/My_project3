const express = require('express');
const fs = require('fs');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');

const app = express();
const PORT = 8080;
const PRODUCTS_FILE = path.join(__dirname, 'products.json');

const swaggerDocument = YAML.load(path.join(__dirname, 'api-spec.yaml'));

app.use(express.json());

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get('/products', (req, res) => {
    fs.readFile(PRODUCTS_FILE, (err, data) => {
        if (err) {
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            res.status(200).json(JSON.parse(data));
        }
    });
});

app.post('/products', (req, res) => {
    const newProduct = req.body;
    fs.readFile(PRODUCTS_FILE, (err, data) => {
        if (err) {
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            const products = JSON.parse(data);
            products.push(newProduct);
            fs.writeFile(PRODUCTS_FILE, JSON.stringify(products, null, 2), (err) => {
                if (err) {
                    res.status(500).json({ error: 'Internal Server Error' });
                } else {
                    res.status(201).json(newProduct);
                }
            });
        }
    });
});

app.put('/products/:id', (req, res) => {
    const productId = parseInt(req.params.id);
    const updatedProduct = req.body;
    fs.readFile(PRODUCTS_FILE, (err, data) => {
        if (err) {
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            let products = JSON.parse(data);
            const index = products.findIndex(p => p.id === productId);
            if (index !== -1) {
                products[index] = { ...products[index], ...updatedProduct };
                fs.writeFile(PRODUCTS_FILE, JSON.stringify(products, null, 2), (err) => {
                    if (err) {
                        res.status(500).json({ error: 'Internal Server Error' });
                    } else {
                        res.status(200).json(products[index]);
                    }
                });
            } else {
                res.status(404).json({ error: 'Product not found' });
            }
        }
    });
});

app.delete('/products/:id', (req, res) => {
    const productId = parseInt(req.params.id);
    fs.readFile(PRODUCTS_FILE, (err, data) => {
        if (err) {
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            let products = JSON.parse(data);
            const index = products.findIndex(p => p.id === productId);
            if (index !== -1) {
                products.splice(index, 1);
                fs.writeFile(PRODUCTS_FILE, JSON.stringify(products, null, 2), (err) => {
                    if (err) {
                        res.status(500).json({ error: 'Internal Server Error' });
                    } else {
                        res.status(200).json({ message: 'Product deleted' });
                    }
                });
            } else {
                res.status(404).json({ error: 'Product not found' });
            }
        }
    });
});

app.listen(PORT, () => {
    console.log(`Admin server is running on http://localhost:${PORT}`);
});