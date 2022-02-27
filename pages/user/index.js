import React from 'react'
import Cookie from 'universal-cookie'
import { useEffect, useState } from 'react';
import axios from 'axios'
import styles from '../../styles/Styles.module.css'
import Router from 'next/router'
import Progressbar from './components/Progressbar.js'
import Form from './components/Form'
import FileContainer from './components/FileContainer'

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

    function Delete(name) {
        axios.delete('http://localhost:3001/files/delete', {
            params: { username: cookie.get('LoggedIn'),name:name},
            headers: { 'Content-Type': 'application/json'}
        })
        .then(response => {
            if (response.data.status === true) {
                setRefresh(refresh+1)
            }
        })
    }

    function DeleteAccount() {
        axios.delete('http://localhost:3001/user/delete', {
            params: { username: cookie.get('LoggedIn')},
            headers: { 'Content-Type': 'application/json'}
        })
        .then(response => {
            if (response.data.success === true) {
                cookie.remove("LoggedIn")
                location.reload();
            }
        })
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
            <div className={styles.LogOut}>
                <button onClick={LogOut} >Log Out</button>
                <button onClick={DeleteAccount}>Delete Account</button>
            </div>
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
                        <FileContainer data={file} Download={Download} Delete={Delete} />
                    )
                })
            }
            </div>
        </div>
    )
}
