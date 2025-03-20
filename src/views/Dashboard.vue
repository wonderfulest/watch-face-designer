<template>
    <!-- 在仪表盘中添加快捷入口卡片 -->
    <div class="quick-access-cards">
        <!-- 字体预览卡片 -->
        <el-card class="quick-access-card" shadow="hover" @click="router.push('/fonts')">
            <div class="card-content">
                <el-icon class="card-icon">
                    <FontIcon />
                </el-icon>
                <h3>字体预览</h3>
                <p>浏览和预览系统支持的字体</p>
            </div>
        </el-card>
    
        <!-- 帮助中心卡片 -->
        <el-card class="quick-access-card" shadow="hover" @click="router.push('/FAQ')">
            <div class="card-content">
                <el-icon class="card-icon">
                    <QuestionFilled />
                </el-icon>
                <h3>帮助中心</h3>
                <p>查看使用指南和常见问题</p>
            </div>
        </el-card>
    </div>
</template>

<style scoped>
.quick-access-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 20px;
    padding: 20px;
}

.quick-access-card {
    cursor: pointer;
    transition: transform 0.2s;
}

.quick-access-card:hover {
    transform: translateY(-4px);
}

.card-content {
    text-align: center;
    padding: 20px;
}

.card-icon {
    font-size: 32px;
    color: var(--el-color-primary);
    margin-bottom: 12px;
}

.card-content h3 {
    margin: 12px 0;
    font-size: 18px;
    color: #303133;
}

.card-content p {
    color: #909399;
    font-size: 14px;
}
</style>