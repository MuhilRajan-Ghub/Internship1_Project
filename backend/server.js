const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const cors = require('cors');
const nodemailer = require('nodemailer');
const multer = require('multer');
const fs = require("fs");
const upload = multer({ dest: 'backend/uploads' }); // Set the destination folder for uploaded files


const app = express();
app.use(bodyParser.json());
app.use(cors());

const db = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: 'mehamurali12',
    database: 'DB',
});


db.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to the database');
});

// API endpoint for login
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    console.log('Received login request:', { username, password });

    // Query the database to check credentials
    const query = 'SELECT * FROM user WHERE BINARY username = ? AND BINARY password = ?';
    db.query(query, [username, password], (error, results) => {
        if (error) {
            console.log('Database error:', error);
            res.status(500).json({ message: 'Database error' });
        } else {
            if (results.length > 0) {
                console.log('Login successful for:', username);
                res.status(200).json({ message: 'Logged in successfully' });
            } else {
                console.log('Login failed for:', username);
                res.status(401).json({ message: 'Invalid credentials' });
            }
        }
    });
});

// API endpoints for email management
app.get('/api/emails', (req, res) => {
    const query = 'SELECT * FROM emails';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching emails:', err);
            return res.status(500).json({ message: 'Error fetching emails' });
        }
        const emails = results.map((row) => row.email);
        res.json(emails);
    });
});

app.post('/api/emails', (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: 'Email is required' });
    }

    const query = 'INSERT INTO emails (email) VALUES (?)';
    db.query(query, [email], (err) => {
        if (err) {
            console.error('Error inserting email:', err);
            return res.status(500).json({ message: 'Error inserting email' });
        }
        return res.status(200).json({ message: 'Email inserted successfully' });
    });
});

app.post('/api/send-emails', async (req, res) => {
    const { subject, content, recipients } = req.body;

    if (!subject || !content || !recipients) {
        return res.status(400).json({ message: 'Subject, content, and recipients are required' });
    }

    try {
        // Create a Nodemailer transporter
        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: 'yosisoftnewsletter@gmail.com',
                pass: 'nsccdoczkhhmtkin',
            },

        }, {
            debug: true
        });

        transporter.on('login', () => {
            console.log('Nodemailer logged in to your Gmail account');
        });

        // Configure the email options
        const mailOptions = {
            from: 'yosisoftnewsletter@gmail.com',
            to: recipients.join(','),
            subject: subject,
            text: content,
        };

        // Send the email
        await transporter.sendMail(mailOptions);
        console.log('Email sent');
        return res.status(200).json({ message: 'Email sent successfully' });
    } catch (error) {
        console.error('Error sending email:', error);
        return res.status(500).json({ message: 'Error sending email' });
    }
});

app.post('/api/send-attachments', upload.single('file'), (req, res) => {
    const { recipients } = req.body;
    const attachmentPath = req.file.path;
    const recString = recipients.substring(1, recipients.length - 1);
    const list = recString.split(',');

    const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: 'yosisoftnewsletter@gmail.com',
            pass: 'nsccdoczkhhmtkin',
        },

    }, {
        debug: true
    });

    transporter.on('login', () => {
        console.log('Nodemailer logged in to your Gmail account');
    });

    const mailOptions = {
        from: 'yosisoftnewsletter@gmail.com',
        to: list,
        subject: 'A Newsletter Update From Yosisoft!',
        text: 'Please refer to the attachment for more information',
        attachments: [
            {
                filename: req.file.originalname,
                path: attachmentPath,
            },
        ],
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email:', error);
            res.status(500).send('Error sending email');
        } else {
            console.log('Email sent:', info.response);
            res.status(200).send('Email sent');
        }

        fs.unlink(attachmentPath, (err) => {
            if (err) {
                console.error('Error deleting attachment:', err);
            }
        });
    });
});


app.delete('/api/emails/:email', (req, res) => {
    const { email } = req.params;

    const query = 'DELETE FROM emails WHERE email = ?';
    db.query(query, [email], (err, result) => {
        if (err) {
            console.error('Error deleting email:', err);
            return res.status(500).json({ message: 'Error deleting email' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Email not found' });
        }
        return res.status(200).json({ message: 'Email removed successfully' });
    });
});

const port = 8081;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});