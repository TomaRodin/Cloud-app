import { useRef } from 'react'
import React from 'react'
import {useState} from 'react'
import axios from 'axios'
import Cookie from 'universal-cookie'
import styles from '../../../styles/Styles.module.css'


const Form = (props) => {
    const [selectedFile, setSelectedFile] = React.useState(null);
    const cookie = new Cookie();
    const [Label, setLabel] = useState();
  
    const handleSubmit = (event) => {
      setLabel("")
      event.preventDefault()
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('name', cookie.get('LoggedIn'));

      const authUsername = 'admin'
      const authPassword = 'admin123'
    
      const token = Buffer.from(`${authUsername}:${authPassword}`, 'utf8').toString('base64')

      try {
        axios({
          method: "post",
          mode: 'cors',
          url: "http://localhost:3001/files/upload",
          data: formData,
          headers: { "Content-Type": "multipart/form-data", "Authorization": `Basic ${token}` }
        }).then(response => {
          if (response.data.status === true) {
            props.setRefresh(props.refresh+1)
          }
          else if (response.data.status === false) {
            setLabel("Cloud is full!")
          }
        })
      } catch(error) {
        console.log(error)
      }
      document.getElementById('form').reset();
    }
  
    const handleFileSelect = (event) => {
      setSelectedFile(event.target.files[0])
    }

    const handleSelect = (e) => {

      if (e.target.value === "size") {
        props.SortSize()
      }
      else if (e.target.value === "last") {
        props.setRefresh(props.refresh+1)
      }
    }

    function handleShared() {
      if (props.Sh.length > 1) {
        props.setSh([])
        props.setRefresh(props.refresh+1)
      }
      else {
      axios.get('http://localhost:3001/ShareData/'+cookie.get('LoggedIn'))
      .then (response => {
        props.setFilesData([])
        props.setSh(response.data)
      })
      }

    }

  
    return (
      <form id="form" onSubmit={handleSubmit}>
        <input type="file" name="upload_file" onChange={handleFileSelect} />
        <input type="submit" value="Upload File" />
        <p>{Label}</p>
        <select onChange={handleSelect}>
          <option value="last" >Last Modified</option>
          <option value="size" >Size (Bigger to smaller)</option>
        </select>
        <a className={styles.SharedButton} onClick={handleShared} >Shared</a>
      </form>
    )
  };
  
  export default Form;