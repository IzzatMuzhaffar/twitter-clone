import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { collection, doc, getDoc, getDocs, setDoc } from "firebase/firestore"
import { db } from "../../firebase"

// action/message fetchPostsByUser
export const fetchPostsByUser = createAsyncThunk(
    "posts/fetchByUser",
    async (userId) => {
        try {
            const postsRef = collection(db, `/users/${userId}/posts`)
            console.log(postsRef)
            // const postsRef = collection(db, `/users/123/posts`)

            const querySnapshot = await getDocs(postsRef)
            const docs = querySnapshot.docs.map(doc => ({
                // doc = {
                //  id: 123,
                //  data() => {content: "hello from firebase"}
                // }

                id: doc.id,
                // id: 123
                // 
                ...doc.data()
                // ...{content: "hello from firebase"}
                // 
                // last becomes:
                // doc = {id: 123, content: "hello from firebase"}

            }))
            return docs
        } catch (error) {
            console.error(error)
            throw error
        }
    }
)

// action/message savePost
export const savePost = createAsyncThunk(
    "posts/savePost",
    async ({ userId, postContent }) => {
        try {
            const postsRef = collection(db, `/users/${userId}/posts`)
            console.log(`/users/${userId}/posts`)
            // Since no ID is given, Firestore will auto generate a unique ID for this new document
            const newPostRef = doc(postsRef)
            console.log(postContent)
            await setDoc(newPostRef, { content: postContent, likes: [] })
            const newPost = await getDoc(newPostRef)

            const post = {
                id: newPost.id,
                ...newPost.data()
            }

            return post
        } catch (error) {
            console.error(error)
            throw error
        }
    }
)

// action likePost
export const likePost = createAsyncThunk(
    "posts/likePost",
    async ({ userId, postId }) => {
        try {
            const postRef = doc(db, `/users/${userId}/posts/${postId}`)

            const docSnap = await getDoc(postRef)

            if (docSnap.exists()) {
                const postData = docSnap.data()
                const likes = [...postData.likes, userId]

                await setDoc(postRef, { ...postData, likes })
            }

            return { userId, postId }
        } catch (error) {
            console.error(error)
            throw error
        }
    }
)

// action removeLikeFromPost
export const removeLikeFromPost = createAsyncThunk(
    "posts/removeLikeFromPost",
    async ({ userId, postId }) => {
        try {
            const postRef = doc(db, `/users/${userId}/posts/${postId}`)

            const docSnap = await getDoc(postRef)

            if (docSnap.exists()) {
                const postData = docSnap.data()
                const likes = postData.likes.filter((id) => id !== userId)

                await setDoc(postRef, { ...postData, likes })
            }

            return { userId, postId }
        } catch (error) {
            console.error(error)
            throw error
        }
    }
)

// Slice
const postsSlice = createSlice({
    name: "posts",
    initialState: { posts: [], loading: true },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchPostsByUser.fulfilled, (state, action) => {
                // action.payload comes from the output of fetchPostByUser async thunk
                // action.payload = [{id: 1, content: "when is lunch"}]
                state.posts = action.payload
                // state.posts = []
                // state.posts is the current posts that you are showing
                // state.posts = [{id: 1, content: "when is lunch"}]
                state.loading = false // to stop the loading animation
            })
            .addCase(savePost.fulfilled, (state, action) => {
                state.posts = [action.payload, ...state.posts]
                // action.payload comes from the output of savePost async thunk
                // action.payload = [{id: 1, content: "when is lunch"}]

                // state.posts refers to the current posts in the postsSlice state
                // state.posts = [{id: 7, content: "when is dinner"}, {id: 6, content: "when is breakfast"}]

                // state.posts = [action.payload, ...state.posts]
                // state.posts = [{id: 8, content: "when is lunch"}, ...state.posts]
                // state.posts = [{id: 8, content: "when is lunch"}, {id: 7, content: "when is dinner"}, , {id: 6, content: "when is breakfast"}]
            })
            .addCase(likePost.fulfilled, (state, action) => {
                const { userId, postId } = action.payload

                const postIndex = state.posts.findIndex((post) => post.id === postId)

                if (postIndex !== -1) {
                    state.posts[postIndex].likes.push(userId)
                }
            })
            .addCase(removeLikeFromPost.fulfilled, (state, action) => {
                const { userId, postId } = action.payload

                const postIndex = state.posts.findIndex((post) => post.id === postId)

                if (postIndex !== -1) {
                    state.posts[postIndex].likes = state.posts[postIndex].likes.filter(
                        (id) => id !== userId
                    )
                }
            })
    }
})

export default postsSlice.reducer
