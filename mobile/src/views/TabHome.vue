<template>
    <div class="page">
        <div class="search-panel">
            <mt-search v-model="value"
                placeholder="请输入关键字搜索"
                cancel-text="清除"
                @keyup.enter.native="search">
            </mt-search>
        </div>

        <div class="page-content">
            <!-- Banner -->
            <mt-swipe class="banner"
                :auto="4000">
                <mt-swipe-item v-for="(item, index) in bannerList"
                    :key="index">
                    <div class="banner-container"
                        @click="bannerClick(item)">
                        <img class="banner-img"
                            :src="_getFirstImage(item.img)"
                            alt="" />
                        <div class="info">
                            <p>{{ item.name }}</p>
                        </div>
                    </div>
                </mt-swipe-item>
            </mt-swipe>
            <div class="category-list">
                <div class="category-item"
                    v-for="(item, index) in categoryList"
                    @click="changeCategory(item)"
                    :key="index">
                    <div class="box">
                        <img class="categoty-img"
                            :src="item.img" />

                    </div>
                    <p>{{ item.name }}</p>
                </div>
            </div>

            <!-- 商品列表 -->
            <div class="goods-list">
                <div class="goods-item"
                    v-for="(item, index) in goodsList"
                    :key="index"
                    @click="goodClick(item)">
                    <div class="img-header">
                        <img class="goods-img"
                            :src="_getFirstImage(item.img)" />
                    </div>
                    <div>
                        <p class="goods-item-name">{{ item.name }}</p>
                        <p class="goods-item-price">
                            <span class="goods-item-priceSymbol">￥</span><span>{{ (item.price / 100).toFixed(2) }}</span>
                        </p>
                    </div>
                </div>
            </div>

            <div class="no-data"
                v-show="!goodsList || goodsList.length == 0">
                <i class="icon mintui mintui-meiyoushuju"></i>
                <p>没有数据...</p>
            </div>
        </div>
    </div>
</template>

<script>
import { getCategorys, getBannerList, getGoodsList } from "@/api/goods";

export default {
    data() {
        return {
            bannerList: [],
            categoryList: [],
            goodsList: [],
            value: "",
            selectedCategory: 0,
        };
    },
    components: {},
    async created() {
        this.refresh();
    },
    methods: {
        async showPage() {
            this.refresh();
        },
        async refresh() {
            let cdata = await getCategorys();
            if (cdata.res_code > 0) {
                if (cdata.data.length > 8) {
                    cdata.data = cdata.data.slice(1, 9);
                }
                this.categoryList = cdata.data;
            }

            let bdata = await getBannerList();
            if (bdata.res_code > 0) {
                this.bannerList = bdata.data;
            }

            let gdata = await getGoodsList();
            if (gdata.res_code > 0) {
                this.goodsList = gdata.data;
            }
        },
        bannerClick(item) {
            this.$router.push({
                path: "/gooddetail",
                query: {
                    gid: item.gid,
                },
            });
        },
        goodClick(item) {
            this.$router.push({
                path: "/gooddetail",
                query: {
                    gid: item.gid,
                },
            });
        },
        changeCategory(item) {
            this.selectedCategory = item.cid;
            this.search();
        },
        search() {
            this.onSearch(this.selectedCategory, this.value);
        },
        async onSearch(cid, cname) {
            let data = await getGoodsList({ cid, name: cname });
            if (data.res_code > 0) {
                this.goodsList = data.data;
            }
        },
        _getFirstImage(imgStr) {
            if (imgStr) {
                imgStr = JSON.parse(imgStr);
                if (imgStr.length > 0) {
                    return imgStr[0];
                }
            }
            return require("../assets/img/none.png");
        },
    },
};
</script>

<style scoped>
.page {
    position: relative;
}
.page-content {
    padding-top: 3px;
}

.search-panel {
    background: #fff;
}

.mint-search {
    height: auto;
}
.buyer {
    margin: 10px 10px 0 10px;
    padding: 10px;
    border-radius: 10px;
    background: #fff;
}
.buyer-menu {
    display: flex;
    flex-direction: row;
    justify-content: space-around;
    align-items: center;
    color: #222;
    flex-wrap: wrap;
}
.buyer-menu > div {
    flex: 1;
    display: flex;
    width: 25%;
    flex-wrap: wrap;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    padding: 5px 0;
}
.buyer-menu > div > i {
    font-size: 2em;
}
.buyer-menu > div > span {
    font-size: 0.9em;
}
.category-list {
    width: 100%;
    background-color: white;
    flex-wrap: wrap;
    display: flex;
    flex-direction: row;
}
.category-list p {
    font-size: 12px;
}

.category-item {
    padding: 10px 20px;
    width: calc(100% / 4);
    height: calc(100% / 4);
    text-align: center;
}
.box {
    position: relative;
    width: 100%;
    height: 0;
    padding-bottom: 100%;
}
.categoty-img {
    position: absolute;
    top: 15%;
    left: 15%;
    width: 70%;
    height: 70%;
}

.searchbar {
    position: fixed;
    top: 0;
    width: 100%;
    z-index: 100;
}

.banner {
    height: 180px;
    margin: 0;
}
.banner-container {
    position: relative;
}

.banner-container > .banner-img {
    width: 100%;
    height: 180px;
    object-fit: cover;
}

.banner-container > .info {
    height: 30px;
    background: #000;
    opacity: 0.3;
    color: #eee;
    position: absolute;
    top: 150px;
    width: 100%;
}

.banner-container > .info > p {
    line-height: 30px;
    margin-left: 10px;
    font-size: 12px;
}

.goods-list {
    box-sizing: border-box;
    position: relative;
    padding: 0 0 0 6px;
}

.goods-item {
    box-sizing: border-box;
    display: inline-block;
    background: #fff;
    border-radius: 0px;
    margin: 5px 5px 0 0;
    width: calc(100vw / 2 - 8px);
}

.img-header {
    position: relative;
    width: 100%;
    height: 0;
    padding-top: 100%;
}
.img-header > .goods-img {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.goods-item-name {
    margin: 5px 3px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 12px;
    color: #000000;
}

.goods-item-price {
    margin: 3px;
    font-weight: bold;
    font-size: 12px;
}
.goods-item-price > span {
    font-family: "Alata";
    color: #cf130a;
    font-size: 18px;
}
.no-data {
    padding: 50px;
    text-align: center;
    color: #c0c0c0;
    font-size: 1.2em;
}
.no-data .icon {
    width: 80px;
    height: 80px;
    font-size: 5em;
}
</style>