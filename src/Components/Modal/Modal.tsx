import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import './Modal.css';

interface IModalProps extends React.HTMLAttributes<HTMLDialogElement> {
    open: boolean;
    onClose: () => void;
    children: React.ReactNode;
}

const Modal: React.FC<IModalProps> = ({ children, open, onClose, ...props }) => {
    const modalRef = useRef<HTMLDialogElement | null>(null);
    const sModalRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (modalRef.current) {
            if (open) {
                modalRef.current?.showModal();
            } else {
                modalRef.current?.close();
            }
        }
    }, [open]);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as Node;
            if (sModalRef.current && !sModalRef.current.contains(target)) {
                modalRef.current?.close();
                if (typeof onClose === 'function') {
                    onClose();
                }
            }
        };

        if (open) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [open, onClose]);

    return createPortal(
        <dialog className={'modal_root'} ref={modalRef} {...props}>
            <div className="modal_content" ref={sModalRef}>
                {children}
            </div>
        </dialog>,
        document.getElementById('modal') as HTMLElement
    );
};

export default Modal;
