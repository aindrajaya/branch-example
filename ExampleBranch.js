/* eslint-disable prettier/prettier */
import React, { Component } from 'react';
import {ScrollView, StyleSheet, Text, View, Linking} from 'react-native';

import branch, {BranchEvent} from 'react-native-branch';

import Button from './Button';

export default class ExampleBranch extends Component {
  //add ExampleBranch state
  product = null;

  state = {
    results: [],
  };

  componentWillUnmount() {
    if (!this.product) {
      return;
    }
    this.product.release();
  }

  /**
   * Create content reference - Adidas Shoes object
   */
  dataCommerceShoesAdidas = async () => {
    try {
      let res = await branch.createBranchUniversalObject('adidasItem/12345', {
        canonicalUrl: 'https://www.adidas.com/us/nmd_r1-shoes/FZ3777.html',
        title: 'NMD R1',
        contentMetadata: {
          quantity: 1,
          price: 23.12,
          sku: '1994320302',
          productName: 'Shoes Adidas',
          productBrand: 'Adidas',
          customMetadata: {
            og_title: 'Adidas Shoes',
            og_description: 'Adidsa shoes for runner',
          },
        },
      });
      if (this.product) {
        this.product.release();
      }
      this.product = res;
      console.log('createBranchUniversalObject', res);
      this.addResult('success', 'createBranchAdidasObject', res);
    } catch (error) {
      console.log('createBranchUniversalObject err', error.toString());
      this.addResult('error', 'createBranchAdidasObject', error.toString());
    }
  };

  /**
   * Create deep link - generate short url
   */
  generateShortUrl = async () => {
    let link = {
      feature: 'sharing',
      channel: 'adidas',
      campaign: 'content addidas shoes',
    };

    let controlParams = {
      desktop_url: 'https://adidas.com/',
      custom: 'data',
    };

    if (!this.product) {
      let res = await branch.createBranchUniversalObject(
        'item/1',
        {
        canonicalUrl: 'https://www.adidas.com/us/nmd_r1-shoes/FZ3777.html',
        title: 'NMD R1',
        contentMetadata: {
          quantity: 1,
          price: 23.12,
          sku: '1994320302',
          productName: 'Shoes Adidas',
          productBrand: 'Adidas',
           customMetadata: {
             og_title: 'Adidas Shoes',
             og_description: 'Adidsa shoes for runner',
           },
        },
      });
      this.product = res;
    }
    try {
      let result = await this.product.generateShortUrl(link, controlParams);
      console.log('generateShortUrl', result);
      this.addResult('success', 'generateShortUrl', result);
    } catch (err) {
      console.log('generateShortUrl err', err);
      this.addResult('error', 'generateShortUrl', err.toString());
    }
  };

  /**
   * Share deep link
   */
  shareDeepLink = async () => {
    let shareOptions = {
      messageHeader: 'Check this out',
      messageBody: 'No really, check this out!',
    };
    let linkProperties = {
      feature: 'sharing',
      channel: 'facebook',
    };
    let controlParams = {
      $desktop_url: 'http://example.com/home',
      $ios_url: 'http://example.com/ios',
    };
    try {
      let {channel, completed, error} = await this.product.showShareSheet(shareOptions, linkProperties, controlParams);
      this.addResult('success', 'showShareSheet', completed);
    } catch (err) {
      console.log('showShareSheet err', err.toString());
      this.addResult('error', 'showShareSheet', err.toString());
    }
  }

  /**
   * Read Deep Link
   */
   readLastAttributedTouchData = async () => {
    const attributionWindow = 365;
    try {
      let latd = await branch.lastAttributedTouchData(attributionWindow);
      console.log('lastAttributedTouchData', latd);
      this.addResult('success', 'lastAttributedTouchData', latd);
    } catch (err) {
      console.log('lastAttributedTouchData', err);
      this.addResult('error', 'lastAttributedTouchData', err.toString());
    }
  };

  /**
   * QR Code
   */
  qrCodeFeature = async () => {
    var qrCodeSettings = {
      width: 500,
      codeColor: '#3b2016',
      backgroundColor: '#a8e689',
      centerLogo: 'https://www.freepnglogos.com/uploads/qr-code-png/qr-code-code-sticker-transparent-png-svg-vector-19.png',
      margin: 1,
      imageFormat: 'PNG',
    };

    var options = {
      title: 'Content Test',
      contentDescription: 'A test content desc',
      contentMetadata: {
        price: '200',
        productName: 'QR Code Scanner',
        customMetadata: {
          og_title: 'Adidas Shoes',
          og_description: 'Adidsa shoes for runner',
        },
      },
    };

    var lp = {
      feature: 'qrCode',
      tags: ['test', 'working'],
      channel: 'facebook',
      campaign: 'posters',
    };

    var controlParams = {
      $desktop_url: 'https://www.adidas.com',
      $fallback_url: 'https://www.adidas.com',
    };

    try {
      let result = await branch.getBranchQRCode(qrCodeSettings, options, lp, controlParams);
      console.log('QR Code', result);
      this.addResult('success', 'qrCodeFeature', result);
    }
    catch (err) {
      console.log('QR Code Err: ', err);
      console.log('lastAttributedTouchData', err);
      this.addResult('error', 'qrCodeFeature', err.toString());
    }
  }

  /**
   * Event track Users
   */
   eventTrackUser = async () => {
    try {
      let dataUser = branch.setIdentity('UserFromSavana');
      branch.logout();
      this.addResult(
        'success',
        'eventTrackUser',
        dataUser,
      );
    } catch (err) {
      console.log('sendStandardEvent err', err);
      this.addResult(
        'error',
        'eventTrackUser',
        err.toString(),
      );
    }
  }

  /**
   * Track Commerce Event Purchase
   */
  logStandardEventCommercePurchase = async () => {
    if (!this.product) {
      this.dataCommerceShoesAdidas();
    }
    try {
      let branchEventPurchase = new BranchEvent(
        BranchEvent.Purchase,
        [this.product],
        {
          transactionID: '12344554',
          currency: 'USD',
          revenue: 1.5,
          shipping: 10.2,
          tax: 12.3,
          coupon: 'Coupon_Y',
          affiliation: 'test_affiliation',
          description: 'Test purchase event',
          searchQuery: 'test keyword',
          customData: {
            depplink_path: 'product/FZ3777',
            og_app_id: '129087217170262',
            $og_title: 'Adidas Android App from params di luar',
            $canonical_identifier: 'adidas/5324',
          },
          alias: 'WishList',
        },
      );
      branchEventPurchase.logEvent();
      this.addResult(
        'success',
        'logStandardEventCommercePurchase',
        branchEventPurchase,
      );
    } catch (err) {
      console.log('sendStandardEvent err', err);
      this.addResult(
        'error',
        'logStandardEventCommercePurchase',
        err.toString(),
      );
    }
  };

 /**
   * Event Standard Content - Search
   */
  logStandardEventContentSearch = async () => {
    if (!this.product) {
      this.dataCommerceShoesAdidas();
    }
    try {
      let branchEventSearch = new BranchEvent(
        BranchEvent.Search,
        [this.product],
        {
          alias: 'RMD R1 Adidas',
          description: 'Product Search',
          searchQuery: 'black men footbal',
          customData: {
            depplink_path: 'product/FZ3777',
            og_app_id: '129087217170262',
            $og_title: 'Adidas Android App',
            $canonical_identifier: 'adidas/5324',
          },
        },
      );
      branchEventSearch.logEvent();
      this.addResult(
        'success',
        'logStandardEventContentSearch',
        branchEventSearch,
      );
    } catch (err) {
      console.log('sendStandardEvent err', err);
      this.addResult('error', 'logStandardEventContentSearch', err.toString());
    }
  };

  /**
   * Event Standard - Lifecycle
   */
   logStandardEventLifecycleRegister = async () => {
    if (!this.product) {
      this.dataCommerceShoesAdidas();
    }
    try {
      let branchEventRegistration = new BranchEvent(
        BranchEvent.CompleteRegistration,
        [this.product],
        {
          os: 'Android',
          description: 'Preferred',
          developerIdentity: 'user1234',
          // customData: {
          //   depplink_path: 'product/FZ3777',
          //   og_app_id: '129087217170262',
          //   $og_title: 'Adidas Android App',
          //   $canonical_identifier: 'adidas/5324',
          // },
        },
      );
      branchEventRegistration.logEvent();
      this.addResult(
        'success',
        'logStandardEventLifecycleRegister',
        branchEventRegistration,
      );
    } catch (err) {
      console.log('sendStandardEvent err', err);
      this.addResult(
        'error',
        'logStandardEventLifecycleRegister',
        err.toString(),
      );
    }
  };

  /**
   * Event Tracking - Custom
  */
 eventTrackingCustom = async () => {
  if (!this.product) {
    this.dataCommerceShoesAdidas();
  }
  try {
    let params = {
      alias: 'Custom alias',
      customData: {
        depplink_path: 'product/FZ3777',
        og_app_id: '129087217170262',
        $og_title: 'Adidas Android App',
        $canonical_identifier: 'adidas/5324',
      },
    };
    let eventTrackingCustom = new BranchEvent('Custom alias', params);
    eventTrackingCustom.logEvent();
    this.addResult(
      'success',
      'eventTrackingCustom',
      eventTrackingCustom,
    );
  } catch (err) {
    console.log('sendStandardEvent err', err);
      this.addResult(
        'error',
        'eventTrackingCustom',
        err.toString(),
      );
  }
 }

 /**
  * Handle Links Events
 */
handleLinkYourApp = async () => {
  try {
    let handle = branch.openURL('https://aloysius.app.link/EF8tn2kwmdb', {newActivity: true});
    console.log('handleLinkYourApp', handle);
    this.addResult('success', 'handleLinkYourApp', handle);
  } catch (err) {
    console.log('handleLinkYourApp err', err);
    this.addResult('error', 'handleLinkYourApp', err.toString());
  }
}

  addResult(type, slug, payload){
    let result = {type, slug, payload};
    this.setState({
      results: [result, ...this.state.results].slice(0, 10),
    });
  }

  render() {
    return (
      <View style={styles.container}>
      <View style={styles.resultsContainer}>
        <Text style={styles.header}>RESULTS</Text>
        <ScrollView style={styles.scrollContainer}>
          {this.state.results.length === 0 && (
            <Text> No Results yet, run a method below </Text>
          )}
          {this.state.results.map((result, i) => {
            return (
              <View key={i} style={styles.result}>
                <Text
                  style={
                    result.type === 'success'
                   ? styles.textSucccess
                    : styles.textError
                  }>{`${result.slug} (${result.type})`}</Text>
                <Text onPress={()=> Linking.openURL(result.payload.url)}  style={styles.textSmall}>{JSON.stringify(result.payload, null, 2)}</Text>
              </View>
            );
          })}
        </ScrollView>
      </View>
      <Text style={styles.header}>METHODS</Text>
      <ScrollView style={styles.buttonsContainer}>
        <Button onPress={this.dataCommerceShoesAdidas}>Create Branch Adidas Object</Button>
        <Button onPress={this.generateShortUrl}>Deep Link - Generate Short URL</Button>
        <Button onPress={this.shareDeepLink}>Deep Link - Share deep link</Button>
        <Button onPress={this.readLastAttributedTouchData}>Deep Link - Read Last Attributed</Button>
        <Button onPress={this.qrCodeFeature}>Try QR Code</Button>
        <Button onPress={this.eventTrackUser}>Event Track User</Button>
        <Button onPress={this.logStandardEventCommercePurchase}>BranchEvent.logEvent (Commerce Purchase)</Button>
        <Button onPress={this.logStandardEventContentSearch}>BranchEvent.logEvent (Content Search)</Button>
        <Button onPress={this.logStandardEventLifecycleRegister}>BranchEvent.logEvent (Lifecycle Complete Registration)</Button>
        <Button onPress={this.eventTrackingCustom}>BranchEvent.logEvent (Custom Event)</Button>
        <Button onPress={() => branch.openURL('https://aloysius.app.link/EF8tn2kwmdb')}>Handle Link to YourApp</Button>
      </ScrollView>
    </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    marginTop: 30,
    flex: 1,
  },
  header: {
    backgroundColor: '#f19d18',
    padding: 5,
    paddingLeft: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#aaa',
    fontSize: 10,
    fontWeight: 'bold',
  },
  resultsContainer: {
    height: 200,
    backgroundColor: '#fff8e1',
  },
  scrollContainer: {
    padding: 10,
  },
  result: {
    padding: 5,
  },
  textSmall: {
    fontSize: 10,
  },
  textSucccess: {
    color: '#2b8738',
  },
  textError: {
    color: '#a03d31',
  },
  buttonsContainer: {
    flex: 1,
    backgroundColor: '#fff3c9',
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
  },
});
