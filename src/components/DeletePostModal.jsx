import { useContext } from "react";
import { Button, Modal } from "react-bootstrap";
import { useDispatch } from "react-redux";
import { deletePost } from "../features/posts/postsSlice";
import { AuthContext } from "./AuthProvider";

export default function DeletePostModal({
    show,
    handleClose,
    postId
}) {
    const dispatch = useDispatch();
    const { currentUser } = useContext(AuthContext);
    const userId = currentUser.uid;

    const handleDelete = () => {
        dispatch(deletePost({ userId, postId }));
        handleClose();
    };

    return (
        <>
            <Modal show={show} onHide={handleClose}>
                <Modal.Body>
                    <p style={{ fontSize: 20 }}>Delete this tweet?</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        variant="danger"
                        className="rounded-pill"
                        onClick={handleDelete}
                    >
                        Delete
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}


