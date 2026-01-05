import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, X } from 'lucide-react';
import styles from './FilterDropdown.module.css';

interface FilterOption {
    value: string;
    label: string;
}

interface FilterDropdownProps {
    icon: React.ReactNode;
    label: string;
    options: FilterOption[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

const FilterDropdown: React.FC<FilterDropdownProps> = ({
    icon,
    label,
    options,
    value,
    onChange,
    placeholder = 'Select...',
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
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

    const selectedOption = options.find(opt => opt.value === value);
    const hasSelection = value && value !== 'All';

    const handleSelect = (optionValue: string) => {
        onChange(optionValue);
        setIsOpen(false);
    };

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange('All');
    };

    return (
        <div className={styles.container} ref={dropdownRef}>
            <button
                className={`${styles.trigger} ${hasSelection ? styles.active : ''}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className={styles.triggerContent}>
                    {icon}
                    <div className={styles.triggerText}>
                        <span className={styles.label}>{label}</span>
                        <span className={styles.value}>
                            {selectedOption ? selectedOption.label : placeholder}
                        </span>
                    </div>
                </div>
                <div className={styles.triggerActions}>
                    {hasSelection && (
                        <button
                            className={styles.clearBtn}
                            onClick={handleClear}
                            aria-label="Clear filter"
                        >
                            <X size={14} />
                        </button>
                    )}
                    <ChevronDown
                        size={16}
                        className={`${styles.chevron} ${isOpen ? styles.open : ''}`}
                    />
                </div>
            </button>

            {isOpen && (
                <div className={styles.dropdown}>
                    <div className={styles.dropdownHeader}>
                        <span className={styles.dropdownTitle}>Select {label}</span>
                    </div>
                    <div className={styles.options}>
                        {options.map((option) => (
                            <button
                                key={option.value}
                                className={`${styles.option} ${value === option.value ? styles.selected : ''}`}
                                onClick={() => handleSelect(option.value)}
                            >
                                <span>{option.label}</span>
                                {value === option.value && (
                                    <span className={styles.checkmark}>✓</span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default FilterDropdown;

