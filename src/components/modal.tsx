
import { ReactNode } from "react"
import ReactDOM from "react-dom"

interface ModalProps {
    isOpen: boolean,
    onClose: () => void,
    children: ReactNode
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
    if (!isOpen) return null

    const modal = <div className="modal-overlay">
        <div className="modal-content bg-cursedBlack">
            <button className="modal-close-button" onClick={onClose}>X</button>
            <div className="modal-body w-full">{children}</div>
        </div>
    </div>


    return ReactDOM.createPortal(modal,
        document.getElementById('modal-root') as HTMLElement
    )
}

export default Modal