import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import { Plus, Search, Shield, ShieldAlert, ShieldCheck } from 'lucide-react';
import Modal from '../components/common/Modal';
import DeleteConfirmationModal from '../components/common/DeleteConfirmationModal';
import ActionMenu from '../components/common/ActionMenu';
import { useToast } from '../components/common/Toast';
import styles from './Users.module.css';

interface User {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'user' | 'viewer';
    status: 'active' | 'inactive';
    lastLogin: string;
}

const Users = () => {
    const { user } = useSelector((state: RootState) => state.auth);
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
    const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        role: 'user' as 'admin' | 'user' | 'viewer',
        status: 'active' as 'active' | 'inactive',
    });
    const { showToast } = useToast();

    // Mock Users
    const [users, setUsers] = useState<User[]>([
        { id: 1, name: 'Alice Smith', email: 'alice@example.com', role: 'admin', status: 'active', lastLogin: '2 mins ago' },
        { id: 2, name: 'Bob Johnson', email: 'bob@example.com', role: 'user', status: 'active', lastLogin: '1 day ago' },
        { id: 3, name: 'Carol Williams', email: 'carol@example.com', role: 'viewer', status: 'inactive', lastLogin: '5 days ago' },
        { id: 4, name: 'David Brown', email: 'david@example.com', role: 'user', status: 'active', lastLogin: '3 hours ago' },
    ]);

    if (user?.role !== 'admin') {
        return (
            <div className={styles.denied}>
                <h2>Access Denied</h2>
                <p>You do not have permission to view this page.</p>
            </div>
        );
    }

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getRoleIcon = (role: string) => {
        switch (role) {
            case 'admin': return <ShieldAlert size={16} className={styles.adminIcon} />;
            case 'user': return <ShieldCheck size={16} className={styles.userIcon} />;
            default: return <Shield size={16} className={styles.viewerIcon} />;
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            email: '',
            role: 'user',
            status: 'active',
        });
    };

    const handleAddUser = () => {
        if (!formData.name || !formData.email) {
            showToast('Please fill in all required fields', 'error');
            return;
        }

        const newUser: User = {
            id: users.length + 1,
            ...formData,
            lastLogin: 'Never',
        };

        setUsers([...users, newUser]);
        showToast('User added successfully', 'success');
        setIsAddUserModalOpen(false);
        resetForm();
    };

    const handleEditUser = (user: User) => {
        setSelectedUser(user);
        setFormData({
            name: user.name,
            email: user.email,
            role: user.role,
            status: user.status,
        });
        setIsEditUserModalOpen(true);
    };

    const handleUpdateUser = () => {
        if (!formData.name || !formData.email || !selectedUser) {
            showToast('Please fill in all required fields', 'error');
            return;
        }

        setUsers(users.map(u => 
            u.id === selectedUser.id 
                ? { ...u, ...formData }
                : u
        ));
        showToast('User updated successfully', 'success');
        setIsEditUserModalOpen(false);
        setSelectedUser(null);
        resetForm();
    };

    const handleDeleteUser = (user: User) => {
        setSelectedUser(user);
        setIsDeleteModalOpen(true);
    };

    const confirmDeleteUser = () => {
        if (!selectedUser) return;

        setUsers(users.filter(u => u.id !== selectedUser.id));
        showToast('User deleted successfully', 'success');
        setSelectedUser(null);
    };

    const handleToggleStatus = (user: User) => {
        const newStatus = user.status === 'active' ? 'inactive' : 'active';
        setUsers(users.map(u => 
            u.id === user.id 
                ? { ...u, status: newStatus }
                : u
        ));
        showToast(`User ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`, 'success');
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className="text-gradient" style={{ fontSize: '2rem', fontWeight: 700 }}>User Management</h1>
                <button className="btn btn-primary" onClick={() => setIsAddUserModalOpen(true)}>
                    <Plus size={20} />
                    Add User
                </button>
            </div>

            {/* Add User Modal */}
            <Modal
                isOpen={isAddUserModalOpen}
                onClose={() => {
                    setIsAddUserModalOpen(false);
                    resetForm();
                }}
                title="Add New User"
                size="medium"
            >
                <div className={styles.modalForm}>
                    <div className={styles.formGroup}>
                        <label htmlFor="add-name">Name *</label>
                        <input
                            type="text"
                            id="add-name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="Enter user name"
                            className={styles.formInput}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="add-email">Email *</label>
                        <input
                            type="email"
                            id="add-email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="Enter user email"
                            className={styles.formInput}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="add-role">Role</label>
                        <select
                            id="add-role"
                            name="role"
                            value={formData.role}
                            onChange={handleInputChange}
                            className={styles.formInput}
                        >
                            <option value="admin">Admin</option>
                            <option value="user">User</option>
                            <option value="viewer">Viewer</option>
                        </select>
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="add-status">Status</label>
                        <select
                            id="add-status"
                            name="status"
                            value={formData.status}
                            onChange={handleInputChange}
                            className={styles.formInput}
                        >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>

                    <div className={styles.formActions}>
                        <button className="btn btn-ghost" onClick={() => {
                            setIsAddUserModalOpen(false);
                            resetForm();
                        }}>
                            Cancel
                        </button>
                        <button className="btn btn-primary" onClick={handleAddUser}>
                            Add User
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Edit User Modal */}
            <Modal
                isOpen={isEditUserModalOpen}
                onClose={() => {
                    setIsEditUserModalOpen(false);
                    setSelectedUser(null);
                    resetForm();
                }}
                title="Edit User"
                size="medium"
            >
                <div className={styles.modalForm}>
                    <div className={styles.formGroup}>
                        <label htmlFor="edit-name">Name *</label>
                        <input
                            type="text"
                            id="edit-name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="Enter user name"
                            className={styles.formInput}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="edit-email">Email *</label>
                        <input
                            type="email"
                            id="edit-email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="Enter user email"
                            className={styles.formInput}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="edit-role">Role</label>
                        <select
                            id="edit-role"
                            name="role"
                            value={formData.role}
                            onChange={handleInputChange}
                            className={styles.formInput}
                        >
                            <option value="admin">Admin</option>
                            <option value="user">User</option>
                            <option value="viewer">Viewer</option>
                        </select>
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="edit-status">Status</label>
                        <select
                            id="edit-status"
                            name="status"
                            value={formData.status}
                            onChange={handleInputChange}
                            className={styles.formInput}
                        >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>

                    <div className={styles.formActions}>
                        <button className="btn btn-ghost" onClick={() => {
                            setIsEditUserModalOpen(false);
                            setSelectedUser(null);
                            resetForm();
                        }}>
                            Cancel
                        </button>
                        <button className="btn btn-primary" onClick={handleUpdateUser}>
                            Update User
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Delete Confirmation Modal */}
            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => {
                    setIsDeleteModalOpen(false);
                    setSelectedUser(null);
                }}
                onConfirm={confirmDeleteUser}
                title="Delete User"
                message="Are you sure you want to delete this user? This action cannot be undone."
                itemName={selectedUser ? `${selectedUser.name} (${selectedUser.email})` : undefined}
            />

            <div className={`${styles.tableCard} card glass-panel`}>
                <div className={styles.toolbar}>
                    <div className={styles.searchBox}>
                        <Search size={18} className={styles.searchIcon} />
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className={styles.searchInput}
                        />
                    </div>
                </div>

                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>User</th>
                            <th>Role</th>
                            <th>Status</th>
                            <th>Last Login</th>
                            <th style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map((u) => (
                            <tr key={u.id}>
                                <td>
                                    <div className={styles.userInfo}>
                                        <div className={styles.userAvatar}>{u.name.charAt(0)}</div>
                                        <div>
                                            <div className={styles.userName}>{u.name}</div>
                                            <div className={styles.userEmail}>{u.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <div className={styles.roleTag}>
                                        {getRoleIcon(u.role)}
                                        <span style={{ textTransform: 'capitalize' }}>{u.role}</span>
                                    </div>
                                </td>
                                <td>
                                    <span className={`${styles.status} ${u.status === 'active' ? styles.active : styles.inactive}`}>
                                        {u.status}
                                    </span>
                                </td>
                                <td style={{ color: 'var(--text-muted)' }}>{u.lastLogin}</td>
                                <td style={{ textAlign: 'right' }}>
                                    <ActionMenu
                                        onEdit={() => handleEditUser(u)}
                                        onDelete={() => handleDeleteUser(u)}
                                        onToggleStatus={() => handleToggleStatus(u)}
                                        currentStatus={u.status}
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Users;
