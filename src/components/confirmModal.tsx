import Button from "./button"
import Modal from "./modal"

const ConfirmModal: React.FC<{ isOpen: boolean, onClose: () => void, buttonAction: () => void }> = ({ isOpen, onClose, buttonAction }) => {

    return <Modal isOpen={isOpen} onClose={onClose} rootElement="confirm-modal-root" size="small" >
        <div className="flex flex-col gap-4">
            <div className="flex"><span className="text-xl">Confirm</span></div>
            <div className="flex">Proceed with the action?</div>
            <div className="flex justify-end gap-2">
                <Button onClick={onClose} type={"button"} textColor="text-red">Cancel</Button>
                <Button onClick={buttonAction} type={"button"}>Proceed</Button>
            </div>
        </div>
    </Modal>
}

export default ConfirmModal