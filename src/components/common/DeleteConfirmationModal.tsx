import React from 'react';
import { AlertTriangle } from 'lucide-react';
import Modal from './Modal';
import styles from './DeleteConfirmationModal.module.css';

interface DeleteConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    itemName?: string;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    itemName,
}) => {
    const handleConfirm = () => {
        onConfirm();
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title} size="small">
            <div className={styles.content}>
                <div className={styles.iconContainer}>
                    <AlertTriangle size={48} className={styles.icon} />
                </div>
                <p className={styles.message}>{message}</p>
                {itemName && (
                    <div className={styles.itemName}>
                        <strong>{itemName}</strong>
                    </div>
                )}
                <div className={styles.actions}>
                    <button className="btn btn-ghost" onClick={onClose}>
                        Cancel
                    </button>
                    <button className={`btn ${styles.deleteButton}`} onClick={handleConfirm}>
                        Delete
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default DeleteConfirmationModal;

