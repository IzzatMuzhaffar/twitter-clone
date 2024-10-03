import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import axios from "axios"
import { jwtDecode } from "jwt-decode"

const BASE_URL = 'https://6e7d3ebb-8eaf-417a-9235-09e7f854480e-00-13x4y2t148028.pike.repl.co'

// action/message fetchPostsByUser
export const fetchPostsByUser = createAsyncThunk(
    "posts/fetchByUser",
    async (userId) => {
        const response = await fetch(`${BASE_URL}/posts/users/${userId}`)
        return response.json() // this is the action in the addCase
        // return [{id: 1, content: "when is lunch"}]
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
