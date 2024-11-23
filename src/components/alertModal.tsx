import Button from "./button"
import Modal from "./modal"

const AlertModal: React.FC<{ isOpen: boolean, message: string, onClose: () => void }> = ({ isOpen, message, onClose }) => {

    return <Modal isOpen={isOpen} onClose={onClose} rootElement="alert-modal-root" size="small" >
        <div className="flex flex-col gap-4">
            <div className="flex"><span className="text-xl">Alert</span></div>
            <div className="flex">{message}</div>
            <div className="flex justify-end gap-2">
                <Button onClick={onClose} type={"button"}>Ok</Button>
            </div>
        </div>
    </Modal>
}

export default AlertModal