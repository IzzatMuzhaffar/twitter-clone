import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { collection, doc, getDoc, getDocs, setDoc, updateDoc } from "firebase/firestore"
import { db, storage } from "../../firebase"
import { getDownloadURL, ref, uploadBytes } from "firebase/storage"

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
    async ({ userId, postContent, file }) => {
        try {
            let imageUrl = ""
            console.log(file)
            if (file !== null) {
                const imageRef = ref(storage, `posts/${file.name}`)
                const response = await uploadBytes(imageRef, file)
                imageUrl = await getDownloadURL(response.ref)
            }
            const postsRef = collection(db, `/users/${userId}/posts`)
            console.log(`/users/${userId}/posts`)
            // Since no ID is given, Firestore will auto generate a unique ID for this new document
            const newPostRef = doc(postsRef)
            await setDoc(newPostRef, { content: postContent, likes: [], imageUrl })
            console.log(postContent)
            console.log(imageUrl)
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

// action/message updatePost
export const updatePost = createAsyncThunk(
    "posts/updatePost",
    async ({ userId, postId, newPostContent, newFile }) => {
        try {
            // upload the new file to firebase storage and get its URL
            console.log(`updating post id: ${postId}`)
            let newImageUrl = ""
            if (newFile) {
                const imageRef = ref(storage, `posts/${newFile.name}`)
                const response = await uploadBytes(imageRef, newFile)
                newImageUrl = await getDownloadURL(response.ref)
                // newImageUrl = `firebase.storage.com/photos/1`
            }
            const postRef = doc(db, `/users/${userId}/posts/${postId}`)
            const postSnap = await getDoc(postRef)

            if (postSnap.exists()) {
                const postData = postSnap.data() // existing data of our post
                // update the post content and image URL
                const updatedData = {
                    ...postData,
                    content: newPostContent || postData.content,
                    imageUrl: newImageUrl || postData.imageUrl,
                }
                // update the existing document in firestore
                await updateDoc(postRef, updatedData)
                // return the post with updated data
                return updatedData
            } else {
                throw new Error("post doesn't exist")
            }

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
            .addCase(updatePost.fulfilled, (state, action) => {
                // action = {payload: {id: 1, content: "goodbye", imageUrl: "image.com/2"}}
                // state.posts = [
                //  {id: 1, content: "hello", imageUrl: "image.com/1"},
                //  {id: 2, content: "haris", imageUrl: "image.com/108"}
                // ]

                const updatedPost = action.payload

                // return index of the post we want to update
                const postIndex = state.posts.findIndex(
                    post => post.id === updatedPost.id
                )
                console.log(`updating post index: ${postIndex}`)
                // since we want to update id 1 post, it will return us index 0
                // const postIndex = 0
                if (postIndex !== -1) {
                    state.posts[postIndex] = updatedPost
                }
                // state.posts[0] = updatedPost
                // state.posts[0] = {id: 1, content: "goodbye", imageUrl: "image.com/2"}

                // and now the new state posts is:
                // state.posts = [
                //  {id: 1, content: "goodbye", imageUrl: "image.com/2"},
                //  {id: 2, content: "haris", imageUrl: "image.com/108"}
                // ]                
            })
    }
})

export default postsSlice.reducer
