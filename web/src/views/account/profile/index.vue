<script setup lang="ts">
import { onMounted, reactive, ref, computed } from 'vue'
import { useUserStore } from '@/store/modules/user'
import { API } from '@/api'
import type { FormInst, FormRules, UploadCustomRequestOptions } from 'naive-ui'
import { NButton, NForm, NFormItem, NInput, NRadio, NRadioButton, NRadioGroup, NSelect, NUpload, NSpin } from 'naive-ui'
import useScreen from '@/hooks/useResponsive'
import type { TabItem } from '@/layout/ContentLayout/TabLayout/index.vue'

const message = useMessage()
const userStore = useUserStore()
const { deviceSize } = useScreen()

// #region ➤ 个人资料逻辑
// ================================================

const infoFormRef = ref<FormInst | null>(null)
const uploadLoading = ref(false)

const infoForm = reactive({
    username: '',
    nickname: '',
    mobilePhone: '',
    email: '',
    gender: 0,
    avatar: ''
})

const genderOptions = [
    { label: '未知', value: 0 },
    { label: '男', value: 1 },
    { label: '女', value: 2 }
]

const infoRules: FormRules = {
    nickname: [{ required: true, message: '请输入昵称', trigger: 'blur' }],
    email: [
        { required: true, message: '请输入邮箱', trigger: 'blur' },
        { type: 'email', message: '邮箱格式不正确', trigger: 'blur' }
    ],
    mobilePhone: [
        { required: true, message: '请输入手机号', trigger: 'blur' },
        { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' }
    ]
}

function initInfo() {
    const userInfo = userStore.getUserInfo
    if (userInfo) {
        infoForm.username = userInfo.username || userInfo.userName
        infoForm.nickname = userInfo.nickname
        infoForm.mobilePhone = userInfo.mobilePhone
        infoForm.email = userInfo.email || ''
        infoForm.gender = (userInfo as any).gender ?? 0
        infoForm.avatar = userInfo.avatar
    }
}

async function handleUpload({ file, onFinish, onError }: UploadCustomRequestOptions) {
    if (file.file && file.file.size > 5 * 1024 * 1024) {
        message.error('图片大小不能超过 5MB')
        onError()
        return
    }
    try {
        uploadLoading.value = true
        const formData = new FormData()
        formData.append('file', file.file as File)
        const res = await API.common.UploadImage(formData)
        infoForm.avatar = res.data.fileUrl
        message.success('头像上传成功，请记得点击保存')
        onFinish()
    } catch (error) {
        message.error('头像上传失败')
        onError()
    } finally {
        uploadLoading.value = false
    }
}

async function handleUpdateProfile() {
    infoFormRef.value?.validate(async (errors) => {
        if (!errors) {
            try {
                await API.auth.updateMe({
                    nickname: infoForm.nickname,
                    email: infoForm.email,
                    mobilePhone: infoForm.mobilePhone,
                    gender: infoForm.gender as 0 | 1 | 2,
                    avatar: infoForm.avatar
                })
                message.success('修改成功')
                await userStore.fetchUserInfo()
            } catch (error) { }
        }
    })
}

// #endregion 个人资料逻辑

// #region ➤ 修改密码逻辑
// ================================================

const pwdFormRef = ref<FormInst | null>(null)
const pwdForm = reactive({ oldPassword: '', newPassword: '', confirmPassword: '' })

function validatePasswordSame(rule: any, value: string) {
    return value === pwdForm.newPassword
}

const pwdRules: FormRules = {
    oldPassword: [{ required: true, message: '请输入旧密码', trigger: 'blur' }],
    newPassword: [
        { required: true, message: '请输入新密码', trigger: 'blur' },
        { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
    ],
    confirmPassword: [
        { required: true, message: '请再次输入新密码', trigger: 'blur' },
        { validator: validatePasswordSame, message: '两次密码输入不一致', trigger: 'blur' }
    ]
}

async function handleChangePassword() {
    pwdFormRef.value?.validate(async (errors) => {
        if (!errors) {
            try {
                await API.auth.changePassword({
                    oldPassword: pwdForm.oldPassword,
                    newPassword: pwdForm.newPassword
                })
                message.success('密码修改成功，请重新登录')
                await userStore.logout()
            } catch (error) {
                console.error(error)
            }
        }
    })
}

function resetPwdForm() {
    pwdForm.oldPassword = ''
    pwdForm.newPassword = ''
    pwdForm.confirmPassword = ''
}

onMounted(() => {
    initInfo()
})
// #endregion 修改密码逻辑

// #region ➤ UI 配置
// ================================================

const formPlacement = computed(() => {
    return deviceSize.value === 0 ? 'top' : 'left'
})

// Tab 配置
const activeTab = ref(0)
const tabList: TabItem<number>[] = [
    { id: 0, label: '修改个人资料' },
    { id: 1, label: '修改密码' },
]

// #endregion UI 配置

</script>

<template>
    <TabLayout v-model:value="activeTab" :tabs="tabList">
        <!-- 修改资料 -->
        <b-scrollbar v-if="activeTab === 0" class="h-full">
            <h2 dashed class="text-xl font-bold text-gray-700 line-height-40px mb-4" title-placement="center">
                基本信息
            </h2>

            <div class="flex flex-col md:flex-row gap-8">
                <!-- 左侧：头像 -->
                <div class="flex flex-col items-center md:w-1/4 gap-4 pt-4 shrink-0">
                    <n-upload class="w-32 h-32" :show-file-list="false"
                        accept="image/png,image/jpeg,image/gif,image/jpg" :custom-request="handleUpload">
                        <div class="relative group cursor-pointer">
                            <n-spin :show="uploadLoading">
                                <img :src="infoForm.avatar" :alt="infoForm.nickname"
                                    class="w-32 h-32 rounded-full border-4 border-gray-100 shadow-sm block object-cover" />
                            </n-spin>
                            <div
                                class="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-sm backdrop-blur-[1px]">
                                <span v-if="!uploadLoading">点击更换</span>
                                <span v-else>上传中...</span>
                            </div>
                        </div>
                    </n-upload>

                    <div class="text-center">
                        <h3 class="text-lg font-medium text-gray-800">{{ infoForm.nickname }}</h3>
                    </div>
                </div>

                <!-- 右侧：表单 -->
                <div class="flex-1 max-w-lg md:w-3/4">
                    <n-form ref="infoFormRef" :model="infoForm" :rules="infoRules" :label-placement="formPlacement"
                        label-width="100" require-mark-placement="right-hanging">
                        <n-form-item label="用户名">
                            <n-input v-model:value="infoForm.username" disabled placeholder="用户名不可修改" />
                        </n-form-item>
                        <n-form-item label="昵称" path="nickname">
                            <n-input v-model:value="infoForm.nickname" placeholder="请输入昵称" />
                        </n-form-item>
                        <n-form-item label="性别" path="gender">
                            <n-radio-group v-model:value="infoForm.gender" name="gender">
                                <n-radio v-for="option in genderOptions" :key="option.value" :value="option.value">
                                    {{ option.label }}
                                </n-radio>
                            </n-radio-group>
                        </n-form-item>
                        <n-form-item label="手机号" path="mobilePhone">
                            <n-input v-model:value="infoForm.mobilePhone" placeholder="请输入手机号" />
                        </n-form-item>
                        <n-form-item label="邮箱" path="email">
                            <n-input v-model:value="infoForm.email" placeholder="请输入邮箱" />
                        </n-form-item>
                        <n-form-item>
                            <div class="flex w-full justify-center ml-0 md:justify-start md:ml-[100px]">
                                <n-button type="primary" @click="handleUpdateProfile">保存修改</n-button>
                            </div>
                        </n-form-item>
                    </n-form>
                </div>
            </div>
            <div class="h-10"></div>
        </b-scrollbar>

        <!-- 修改密码 -->
        <b-scrollbar v-if="activeTab === 1" class="h-full">
            <h2 dashed class="text-xl font-bold text-gray-700 line-height-40px mb-4" title-placement="center">
                安全设置
            </h2>
            <div class="flex justify-center py-4 md:py-8">
                <div class="w-full max-w-lg">
                    <n-form ref="pwdFormRef" :model="pwdForm" :rules="pwdRules" :label-placement="formPlacement"
                        label-width="100">
                        <n-form-item label="旧密码" path="oldPassword">
                            <n-input v-model:value="pwdForm.oldPassword" type="password" show-password-on="click"
                                placeholder="请输入当前密码" />
                        </n-form-item>
                        <n-form-item label="新密码" path="newPassword">
                            <n-input v-model:value="pwdForm.newPassword" type="password" show-password-on="click"
                                placeholder="请输入新密码" />
                        </n-form-item>
                        <n-form-item label="确认密码" path="confirmPassword">
                            <n-input v-model:value="pwdForm.confirmPassword" type="password" show-password-on="click"
                                placeholder="请再次输入新密码" />
                        </n-form-item>

                        <div class="flex justify-center ml-0 gap-4 md:justify-start md:ml-[100px]">
                            <n-button type="primary" @click="handleChangePassword">确认修改</n-button>
                            <n-button @click="resetPwdForm">重置</n-button>
                        </div>
                    </n-form>
                </div>
            </div>
            <div class="h-10"></div>
        </b-scrollbar>
    </TabLayout>
</template>