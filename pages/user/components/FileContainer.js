import styles from '../../../styles/Styles.module.css'

export default function FileContainer(props) {

    const file = props.data

    function Delete() {
        props.Delete(file.name)
    }

    return (
        <div>
            <div className={styles.fileContainer}>
                    <h3>{file.OriginalName}</h3>
                    <button value={file.name} onClick={props.Download}>Download</button>
                    <img value={file.name} onClick={Delete}  className={styles.DeleteButton} src="http://localhost:3001/public/delete.svg"></img>
            </div>
            <br />
        </div>
    )
}