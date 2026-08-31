# ByteBridge Proguard Rules
-keep class com.bytebridge.gateway.core.model.** { *; }
-keep class com.bytebridge.gateway.data.local.entity.** { *; }
-keepclassmembers class * {
    @com.google.gson.annotations.SerializedName <fields>;
}
