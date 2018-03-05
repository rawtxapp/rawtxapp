#include <jni.h>

jstring Java_com_rtxwallet_HelloWorldModule_helloWorldJNI(JNIEnv* env, jobject thiz) {
  return (*env)->NewStringUTF(env, "Hello World!");
}
