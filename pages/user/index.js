import React from 'react'
import Cookie from 'universal-cookie'
import { useEffect, useState } from 'react';
import axios from 'axios'
import styles from '../../styles/Styles.module.css'
import Router from 'next/router'
import Progressbar from './components/Progressbar.js'
import Form from './components/Form'

export default function index() {

    const [data, setData] = useState()
    const [Filesdata, setFilesData] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const cookie = new Cookie();
    const [refresh, setRefresh] = useState(0)

    function LogOut() {
        const cookie = new Cookie();
        cookie.remove("LoggedIn")
        location.reload();
    }

    function Download(e) {
        const user = cookie.get("LoggedIn")
        window.location.replace(`http://localhost:3001/download/${user}/${e.target.value}`)
    }

    useEffect(() => {
        axios.get('http://localhost:3001/files', {
            params: { username: cookie.get('LoggedIn') },
            headers: { 'Content-Type': 'application/json'}
        })
        .then(response => {
            setFilesData(response.data)
        })
    }, [refresh])


    useEffect(() => {
        if (cookie.get('LoggedIn') === undefined) {
            Router.push('/login')
        }
        else {
            const username = 'admin'
            const password = 'admin123'
        
            const token = Buffer.from(`${username}:${password}`, 'utf8').toString('base64')
        
            axios.get('http://localhost:3001/data', {
                params: { username: cookie.get('LoggedIn') },
                headers: { 'Content-Type': 'application/json', 'Authorization': `Basic ${token}`}
            }).then(response => {
                setData(response.data)
                setIsLoading(false)
            })
        }



    }, [refresh])

    if (isLoading) {
        return <p>Loading...</p>
    }

    return (
        <div>
            <h1>{data.username}</h1>
            <div className={styles.typeContainer}>
                <p>{data.type}</p>
            </div>
            <button className={styles.LogOut} onClick={LogOut} >Log Out</button>
            <hr />
            <div className={styles.usageContainer}>
                <h3>Usage:</h3>
                <Progressbar bgcolor="orange" progress={data.used}  height={30} />
                <p>Free: 1GB</p>
            </div>
            <div className={styles.UploadContainer}>
                <Form setRefresh={setRefresh} refresh={refresh} />
                <hr />
            
            {
                Filesdata.map(file => {
                    return(
                        <div>
                            <div className={styles.fileContainer}>
                                    <h3>{file.OriginalName}</h3>
                                    <button value={file.name} onClick={Download}>Download</button>
                            </div>
                            <br />
                        </div>
                    )
                })
            }
            </div>
        </div>
    )
}
