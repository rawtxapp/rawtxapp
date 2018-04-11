FROM golang:1.10

# Taken from roasbeef/btcd-in-a-box

# Grab and install the latest version of btcd and it's dependencies.
#RUN go get github.com/Roasbeef/btcd/...
RUN go get -u github.com/Masterminds/glide
RUN git clone https://github.com/roasbeef/btcd $GOPATH/src/github.com/roasbeef/btcd
RUN cd $GOPATH/src/github.com/roasbeef/btcd && glide install && go install . ./cmd/...

# p2p, and rpc
EXPOSE 8333 8334

# testnet wallet, p2p, and rpc
EXPOSE 18333 18334

RUN mkdir /root/.btcd && mkdir /root/.btcctl

# Generate an automatic RPC conf.
ADD btcd.conf /root/.btcd/
ADD btcctl.conf /root/.btcctl/

ENTRYPOINT ["btcd"]
