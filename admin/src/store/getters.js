const getters = {
  sidebar: state => state.app.sidebar,
  device: state => state.app.device,
  token: state => state.user.token,
  avatar: state => state.user.avatar,
  bucket_id: state => state.user.bucket_id,
  nickname: state => state.user.nickname
}
export default getters
