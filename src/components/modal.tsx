
import { ReactNode } from "react"
import ReactDOM from "react-dom"

interface ModalProps {
  isOpen: boolean,
  onClose: () => void,
  children: ReactNode,
  rootElement?: string,
  size: 'small' | 'medium' | 'large'
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, rootElement = 'modal-root', size }) => {
  if (!isOpen) return null


  let modalSize

  if(size === 'small') {
    modalSize = 'w-1/5'
  } else if(size === 'medium') {
    modalSize = 'w-1/2'
  }

  const modal = <div className="modal-overlay">
    <div className={`modal-content bg-cursedBlack ${modalSize}`}>
      <button className="modal-close-button" onClick={onClose}>X</button>
      <div className="modal-body w-full">{children}</div>
    </div>
  </div>


  return ReactDOM.createPortal(modal,
    document.getElementById(rootElement) as HTMLElement
  )
}

export default Modal