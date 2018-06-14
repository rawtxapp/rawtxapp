#ifndef RtxModule_h
#define RtxModule_h

#import <React/RCTBridgeModule.h>
#import "QRCodeReaderDelegate.h"

@interface RtxModule : NSObject <RCTBridgeModule, NSURLSessionDelegate, QRCodeReaderDelegate>

- (void)URLSession:(NSURLSession *)session didReceiveChallenge:(NSURLAuthenticationChallenge *)challenge completionHandler:(void (^)(NSURLSessionAuthChallengeDisposition, NSURLCredential *))completionHandler;
- (void)reader:(QRCodeReaderViewController *)reader didScanResult:(NSString *)result;
- (void)readerDidCancel:(QRCodeReaderViewController *)reader;
@end

#endif /* RtxModule_h */
