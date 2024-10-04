import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import axios from "axios"
import { collection, getDocs } from "firebase/firestore"
import { jwtDecode } from "jwt-decode"
import { db } from "../../firebase"

// action/message fetchPostsByUser
export const fetchPostsByUser = createAsyncThunk(
    "posts/fetchByUser",
    async () => {
        try {
            const postsRef = collection(db, `/users/XeomRc7lYEY2jmROOKKqzbjnKOv2/posts`)
            console.log("postsRef")
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
    async (postContent) => {
        // Get stored JWT token
        const token = localStorage.getItem('authToken')

        // Decode the token to fetch user id
        const decodedToken = jwtDecode(token)
        const userId = decodedToken.id // ".id" refer to table header in server

        // Prepare data to be sent
        const data = {
            title: "Post Title",
            content: postContent,
            user_id: userId,
        }

        // Make your API call here
        const response = await axios.post(`${BASE_URL}/posts`, data)
        return response.data
    }
)

// Slice
const postsSlice = createSlice({
    name: "posts",
    initialState: { posts: [], loading: true },
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(fetchPostsByUser.fulfilled, (state, action) => {
            // action.payload comes from the output of fetchPostByUser async thunk
            // action.payload = [{id: 1, content: "when is lunch"}]
            state.posts = action.payload
            // state.posts = []
            // state.posts is the current posts that you are showing
            // state.posts = [{id: 1, content: "when is lunch"}]
            state.loading = false // to stop the loading animation
        }),
            builder.addCase(savePost.fulfilled, (state, action) => {
                state.posts = [action.payload, ...state.posts]
                // action.payload comes from the output of savePost async thunk
                // action.payload = [{id: 1, content: "when is lunch"}]

                // state.posts refers to the current posts in the postsSlice state
                // state.posts = [{id: 7, content: "when is dinner"}, {id: 6, content: "when is breakfast"}]

                // state.posts = [action.payload, ...state.posts]
                // state.posts = [{id: 8, content: "when is lunch"}, ...state.posts]
                // state.posts = [{id: 8, content: "when is lunch"}, {id: 7, content: "when is dinner"}, , {id: 6, content: "when is breakfast"}]
            })
    }
})

export default postsSlice.reducer
