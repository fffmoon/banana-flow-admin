<!--
 * @Author: Qing
 * @Description:
 * @Date: 2025-05-07 20:51:00
 * @LastEditTime: 2025-05-08 13:42:50
-->
<script lang='ts' setup>
const userStore = useUserStore()
const { t, changeLocale, changeableLocales, currentLocale, getNaiveuiLocale, d, n } = useLocale()
</script>

<template>
  <FeatureDemo :title="t('i18nPage.title')" :content="t('i18nPage.content')">
    <BSpace class="w-full" vertical>
      <!-- 语言切换卡片 -->
      <NCard :title="t('i18nPage.language.title')">
        <BSpace vertical>
          <div>{{ t('i18nPage.language.select') }}</div>
          <NRadioGroup :value="currentLocale" @update:value="changeLocale">
            <NRadioButton
              v-for="loc in changeableLocales" :key="loc.key" :value="loc.key" :label="loc.label"
              :disabled="loc.disabled"
            />
          </NRadioGroup>
        </BSpace>
      </NCard>

      <NCard :title="t('i18nPage.display.basic')">
        <BSpace vertical>
          <div>{{ t('i18nPage.display.greeting') }}</div>
          <div>{{ t('i18nPage.display.welcome', { name: userStore.getUserInfo?.userName }) }}</div>
        </BSpace>
      </NCard>

      <NCard :title="t('i18nPage.display.datetime')">
        <BSpace vertical>
          <NDatePicker
            type="datetime" :locale="getNaiveuiLocale.dateOptions" :formats="{
              date: t('i18nPage.display.dateFormat'),
              time: t('i18nPage.display.timeFormat'),
            }"
          />
          <div>{{ d(new Date(), 'long') }}</div>
        </BSpace>
      </NCard>

      <NCard :title="t('i18nPage.display.number')">
        <BSpace class="w-full" vertical wrap>
          <div>{{ n(1234.56, 'currency') }}</div>
          <div>{{ n(0.78, 'percent') }}</div>
          <NPagination :page-count="10" :locale="getNaiveuiLocale.options.Pagination" />
        </BSpace>
      </NCard>

      <NCard :title="t('i18nPage.display.plural')">
        <BSpace vertical>
          <div>{{ t('i18nPage.display.messageCount', 0) }}</div>
          <div>{{ t('i18nPage.display.messageCount', 1) }}</div>
          <div>{{ t('i18nPage.display.messageCount', 5) }}</div>
        </BSpace>
      </NCard>
    </BSpace>
  </FeatureDemo>
</template>
