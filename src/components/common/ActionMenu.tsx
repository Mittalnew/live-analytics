import React, { useState, useRef, useEffect } from 'react';
import { Edit, Trash2, ToggleLeft, ToggleRight, MoreVertical } from 'lucide-react';
import styles from './ActionMenu.module.css';

interface ActionMenuProps {
    onEdit: () => void;
    onDelete: () => void;
    onToggleStatus: () => void;
    currentStatus: 'active' | 'inactive';
}

const ActionMenu: React.FC<ActionMenuProps> = ({ onEdit, onDelete, onToggleStatus, currentStatus }) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const handleAction = (action: () => void) => {
        action();
        setIsOpen(false);
    };

    return (
        <div className={styles.container} ref={menuRef}>
            <button
                className={styles.trigger}
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Actions"
            >
                <MoreVertical size={18} />
            </button>

            {isOpen && (
                <div className={styles.menu}>
                    <button
                        className={styles.menuItem}
                        onClick={() => handleAction(onEdit)}
                    >
                        <Edit size={16} />
                        <span>Edit User</span>
                    </button>
                    <button
                        className={styles.menuItem}
                        onClick={() => handleAction(onToggleStatus)}
                    >
                        {currentStatus === 'active' ? (
                            <>
                                <ToggleLeft size={16} />
                                <span>Deactivate</span>
                            </>
                        ) : (
                            <>
                                <ToggleRight size={16} />
                                <span>Activate</span>
                            </>
                        )}
                    </button>
                    <div className={styles.divider} />
                    <button
                        className={`${styles.menuItem} ${styles.danger}`}
                        onClick={() => handleAction(onDelete)}
                    >
                        <Trash2 size={16} />
                        <span>Delete User</span>
                    </button>
                </div>
            )}
        </div>
    );
};

export default ActionMenu;

