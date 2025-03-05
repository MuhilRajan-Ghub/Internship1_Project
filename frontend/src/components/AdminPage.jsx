import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import email_list from './assets/Mobile inbox-rafiki.png';
import compose_email from './assets/Editing body text-bro.png';
import '../styles.css';
import Logo from "./assets/logo.png";
import info from './assets/Email campaign-bro.png';

const App = () => {
    const [emailList, setEmailList] = useState([]);
    const [subject, setSubject] = useState('');
    const [content, setContent] = useState('');
    const [file, setFile] = useState(null);

    useEffect(() => {
        (async () => {
            try {
                await fetchEmails();
            } catch (error) {
                console.error(error);
            }
        })();
    }, []);


    const fetchEmails = async () => {
        try {
            const response = await axios.get('http://localhost:8081/api/emails');
            const fetchedEmails = response.data;
            setEmailList(fetchedEmails);
        } catch (error) {
            console.error(error);
            throw error;
        }
    };

    const sendAttachment = (event) => {
        event.preventDefault();

        const formData = new FormData();
        if (typeof file === 'object' && file instanceof Blob) {
            formData.append('file', file);
        } else {
            console.error('Invalid file type');
            toast.error('Invalid file type');
            return;
        }
        formData.append('recipients', JSON.stringify(emailList));

        axios
            .post('http://localhost:8081/api/send-attachments', formData)
            .then((response) => {
                console.log('Email sent successfully!', response);
                toast.info('Email sent!');
            })
            .catch((error) => {
                console.error('Error sending email:', error);
                toast.error('Error occurred!');
            });
    };

    const handleFileChange = (event) => {
        setFile(event.target.files[0]);
    };

    const removeEmail = async (email) => {
        try {
            await axios.delete(`http://localhost:8081/api/emails/${encodeURIComponent(email)}`);
            await fetchEmails();
            toast.info('Email Removed Successfully!');
        } catch (error) {
            toast.error('An Error Has Occurred!');
            console.error(error);
        }
    };

    const sendEmails = async () => {
        try {
            await axios.post('http://localhost:8081/api/send-emails', {
                subject,
                content,
                recipients: emailList,
            });
            setSubject('');
            setContent('');
            toast.info('Email Sent Successfully!');
        } catch (error) {
            console.error(error);
            toast.error('An Error Has Occurred!');
        }
    };

    return (
        <div className="app-container">
            <ToastContainer />
            <header className="header">
                <img src={Logo} alt="Logo" className="logo" />
            </header>
            <Tabs>
                <TabList className="tab-list">
                    <Tab>Email List</Tab>
                    <Tab>Compose Email</Tab>
                    <Tab>Attachment</Tab>
                </TabList>

                <TabPanel>
                    <div className="email-list-container">
                        <div className="email-list-image">
                            <img src={email_list} alt={'Email List'} className={'Images'} />
                        </div>
                        <div className="email-article">
                            <div className="email-list-items">
                                <h2>Email List</h2>
                                {emailList.map((email) => (
                                    <div key={email} className="email-item">
                                        <span>{email}</span>
                                        <button onClick={() => removeEmail(email)}>Remove</button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </TabPanel>

                <TabPanel>
                    <div className="compose-container">
                        <div className="email-list-image">
                            <img src={compose_email} alt={'Email List'} className={'Images'} />
                        </div>
                        <div className="compose-article">
                            <h2>Compose Email</h2>
                            <div className="compose-email">
                                <input
                                    type="text"
                                    placeholder="Subject"
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                />
                                <br />
                                <br />
                                <textarea
                                    placeholder="Content"
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                />
                                <br />
                                <button onClick={sendEmails}>Send</button>
                            </div>
                        </div>
                    </div>
                </TabPanel>
                <TabPanel>
                        <h2>Attachment</h2>
                    <div className="attachment-container">
                        <div className="email-list-image">
                            <img src={info} alt={'Newsletter'} className={'Images'} />
                        </div>
                        <div className="attachment-article">
                            <form onSubmit={sendAttachment}>
                                <div>
                                    <label htmlFor="file">Attachment:</label>
                                    <input type="file" id="file" onChange={handleFileChange} />
                                </div>

                                <button type="submit">Send</button>
                            </form>
                        </div>
                    </div>
                </TabPanel>


            </Tabs>
        </div>
    );
};

export default App;