import styles from '../../../styles/Styles.module.css'
import ShareContainer from './ShareContainer'

export default function FileContainer(props) {


    
    const file = props.data
    


    function Delete() {
        props.Delete(file.name)
    }

    function Share() {
        props.setIsOpen(<div className={styles.ShareContainer} >
            <ShareContainer fileName={file.name} setIsOpen={props.setIsOpen} />
        </div>)
    }

    function FileExtension(name) {
        return name.split('.').pop(name)
    }


    if (FileExtension(file.name) === "jpeg" || FileExtension(file.name) === "png" || FileExtension(file.name) === "jpg") {
        const src = `http://localhost:3001/preview/${file.name}`
        return (
            <div>
                <div className={styles.fileContainer}>
                    <div>
                        <img className={styles.PreviewImage} src={src}></img>
                    </div>
                    <div className={styles.PreviewImageContainer}>
                        <h3>{file.OriginalName}</h3>
                        <button value={file.name} onClick={props.Download}>Download</button>
                        <img value={file.name} onClick={Delete}  className={styles.DeleteButton} src="http://localhost:3001/public/delete.svg"></img>
                        <img value={file.name} onClick={Share} className={styles.ShareButton} src="http://localhost:3001/public/share.svg"></img>
                    </div>
                </div>
                <br />
            </div>
        )
    }

    return (
        <div>
            <div className={styles.fileContainer}>
                    <h3>{file.OriginalName}</h3>
                    <button value={file.name} onClick={props.Download}>Download</button>
                    <img value={file.name} onClick={Delete}  className={styles.DeleteButton} src="http://localhost:3001/public/delete.svg"></img>
                    <img value={file.name} onClick={Share} className={styles.ShareButton} src="http://localhost:3001/public/share.svg"></img>
            </div>
            <br />
        </div>
    )
}