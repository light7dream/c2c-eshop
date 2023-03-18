import {
    login,
    logout,
    getInfo
} from '@/api/user'
import {
    getToken,
    setToken,
    removeToken
} from '@/utils/auth'
import {
    resetRouter
} from '@/router'

const getDefaultState = () => {
    return {
        token: getToken(),
        nickname: '',
        avatar: '',
        bucket_id: 0,
    }
}

const state = getDefaultState()

const mutations = {
    RESET_STATE: (state) => {
        Object.assign(state, getDefaultState())
    },
    SET_TOKEN: (state, token) => {
        state.token = token
    },
    SET_NICKNAME: (state, nickname) => {
        state.nickname = nickname
    },
    SET_BUCKETID: (state, bucket_id) => {
        state.bucket_id = bucket_id
    },
    SET_AVATAR: (state, avatar) => {
        state.avatar = avatar
    }
}

const actions = {
    // user login
    login({
        commit
    }, userInfo) {
        const {
            phone,
            pwd
        } = userInfo
        return new Promise((resolve, reject) => {
            login({
                phone: phone.trim(),
                pwd: pwd
            }).then(response => {
                const {
                    data
                } = response
                commit('SET_TOKEN', data.token)
                commit('SET_NICKNAME', data.nickname)
                commit('SET_AVATAR', data.avatar)
                commit('SET_BUCKETID', data.bucket_id)
                setToken(data.token)
                resolve()
            }).catch(error => {
                reject(error)
            })
        })
    },

    // get user info
    getInfo({
        commit,
        state
    }) {
        return new Promise((resolve, reject) => {
            getInfo(state.token).then(response => {
                const {
                    data
                } = response

                if (!data) {
                    return reject('验证失败,请重新登录.')
                }

                const {
                    nickname,
                    avatar,
                    bucket_id
                } = data
                commit('SET_NICKNAME', nickname)
                commit('SET_AVATAR', avatar)
                commit('SET_BUCKETID', bucket_id)
                resolve(data)
            }).catch(error => {
                reject(error)
            })
        })
    },

    // user logout
    logout({
        commit,
        state
    }) {
        return new Promise((resolve, reject) => {
            logout(state.token).then(() => {
                removeToken() // must remove  token  first
                resetRouter()
                commit('RESET_STATE')
                resolve()
            }).catch(error => {
                reject(error)
            })
        })
    },

    // remove token
    resetToken({
        commit
    }) {
        return new Promise(resolve => {
            removeToken() // must remove  token  first
            commit('RESET_STATE')
            resolve()
        })
    }
}

export default {
    namespaced: true,
    state,
    mutations,
    actions
}