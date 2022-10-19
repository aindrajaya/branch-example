/* eslint-disable prettier/prettier */
import React, { Component } from 'react';
import {ScrollView, StyleSheet, Text, View, Linking} from 'react-native';

import branch, {BranchEvent} from 'react-native-branch';

import Button from './Button';

export default class ExampleBranch extends Component {
  //add ExampleBranch state
  product = null;

//  state = {
//    results: [],
//  };

  _unsubscribeFromBranch = null
  constructor(props) {
    super(props);
    this.state = {
      results: [],
      subscribeCount: 0,
      lastParamString: '',
    };
  }

  componentDidMount() {
    branch.initSessionTtl = 10000;
    this.subscribeToBranch();
    console.log('RN initSession subscribe from JS');
    this._unsubscribeFromBranch = branch.subscribe(({ error, params }) => {
      console.log('RN initSession subscribe from JS done');
      if (error) {
        this.setState({
          subscribeCount: this.state.subscribeCount - 1,
          lastParamString: JSON.stringify(error),
        });
      } else {
        this.setState({
          subscribeCount: this.state.subscribeCount + 1,
          lastParamString: JSON.stringify(params),
        });
      }
    });
  }

  componentWillUnmount() {
    if (!this.product) {
      return;
    }
    this.product.release();
    if (this._unsubscribeFromBranch) {
      this._unsubscribeFromBranch();
      this._unsubscribeFromBranch = null;
    }
  }

  /**
   * Listening to Deep Links
   */
   subscribeToBranch = () => {
    branch.subscribe(({ error, params }) => {
      if (error) {
        console.error('Error from Branch: ' + error);
        return;
      }
      // params will never be null if error is null
      if (params['+non_branch_link']) {
        const nonBranchUrl = params['+non_branch_link'];
        // Route non-Branch URL if appropriate.
        return;
      }
      if (!params['+clicked_branch_link']) {
        // Indicates initialization success and some other conditions.
        // No link was opened.
        return;
      }
      // A Branch link was opened.
      // Route link based on data in params, e.g.
      // Get title and url for route
      const title = params.$og_title;
      const url = params.$canonical_url;
      const image = params.$og_image_url;
      // Now push the view for this URL
      console.log(title, url, image);
    });
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
   * Navigate to Content
   */
  navigateToContent = async () => {
    try {
      let res = branch.subscribe(({error, params, uri}) => {
        if (error) {
          console.error('Error from Branch: ' + error);
          return;
        }
        // params will never be null if error is null
        if (params['+non_branch_link']) {
          const nonBranchUrl = params['+non_branch_link'];
          // Route non-Branch URL if appropriate.
          return;
        }
        if (!params['+clicked_branch_link']) {
              // A Branch link opened.
            // Route link based on data in params
            this.navigator.push({params: params, uri: uri});
          return;
        }
      });
      console.log('navigateToContent', res);
      this.addResult('success', 'navigateToContent', res);
    } catch (err) {
      console.log('QR Code Err: ', err);
      console.log('navigateToContent', err);
      this.addResult('error', 'navigateToContent', err.toString());
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

  logStandardEventCommerceAddToWhislist = async () => {
    if (!this.product) {
      this.dataCommerceShoesAdidas();
    }
    try {
      let branchEventAddToWhislist = new BranchEvent(
        BranchEvent.AddToWishlist,
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
      branchEventAddToWhislist.logEvent();
      this.addResult(
        'success',
        'logStandardEventCommerceAddToWhislist',
        branchEventAddToWhislist,
      );
    } catch (err) {
      console.log('sendStandardEvent err', err);
      this.addResult(
        'error',
        'logStandardEventCommerceAddToWhislist',
        err.toString(),
      );
    }
  };

  logStandardEventViewCart = async () => {
    if (!this.product) {
      this.dataCommerceShoesAdidas();
    }
    try {
      let branchEventViewCart = new BranchEvent(
        BranchEvent.ViewCart,
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
          alias: 'ViewCart',
        },
      );
      branchEventViewCart.logEvent();
      this.addResult(
        'success',
        'logStandardEventViewCart',
        branchEventViewCart,
      );
    } catch (err) {
      console.log('sendStandardEvent err', err);
      this.addResult(
        'error',
        'logStandardEventViewCart',
        err.toString(),
      );
    }
  };

  logStandardEventCommmerceAddPaymentInfo = async () => {
    if (!this.product) {
      this.dataCommerceShoesAdidas();
    }
    try {
      let branchEventAddPaymentInfo = new BranchEvent(
        BranchEvent.AddPaymentInfo,
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
          alias: 'Add Payment Info',
        },
      );
      branchEventAddPaymentInfo.logEvent();
      this.addResult(
        'success',
        'logStandardEventCommmerceAddPaymentInfo',
        branchEventAddPaymentInfo,
      );
    } catch (err) {
      console.log('sendStandardEvent err', err);
      this.addResult(
        'error',
        'logStandardEventCommmerceAddPaymentInfo',
        err.toString(),
      );
    }
  };

  logStandardEventCommerceClickAd = async () => {
    if (!this.product) {
      this.dataCommerceShoesAdidas();
    }
    try {
      let branchEventClickAd = new BranchEvent(
        BranchEvent.ClickAdd,
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
          alias: 'Click Ad',
        },
      );
      branchEventClickAd.logEvent();
      this.addResult(
        'success',
        'logStandardEventCommerceClickAd',
        branchEventClickAd,
      );
    } catch (err) {
      console.log('sendStandardEvent err', err);
      this.addResult(
        'error',
        'logStandardEventCommerceClickAd',
        err.toString(),
      );
    }
  };

  logStandardEventComerceInitiatePurchase = async () => {
    if (!this.product) {
      this.dataCommerceShoesAdidas();
    }
    try {
      let branchEventInitiatePurchase = new BranchEvent(
        BranchEvent.InitiatePurchase,
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
          alias: 'Initiate Purchase',
        },
      );
      branchEventInitiatePurchase.logEvent();
      this.addResult(
        'success',
        'logStandardEventComerceInitiatePurchase',
        branchEventInitiatePurchase,
      );
    } catch (err) {
      console.log('sendStandardEvent err', err);
      this.addResult(
        'error',
        'logStandardEventComerceInitiatePurchase',
        err.toString(),
      );
    }
  };

  logStandardEventComerceReserve = async () => {
    if (!this.product) {
      this.dataCommerceShoesAdidas();
    }
    try {
      let branchEventReserve = new BranchEvent(
        BranchEvent.Reserve,
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
      branchEventReserve.logEvent();
      this.addResult(
        'success',
        'logStandardEventComerceReserve',
        branchEventReserve,
      );
    } catch (err) {
      console.log('sendStandardEvent err', err);
      this.addResult(
        'error',
        'logStandardEventComerceReserve',
        err.toString(),
      );
    }
  };

  logStandardEventSpendCredits = async () => {
    if (!this.product) {
      this.dataCommerceShoesAdidas();
    }
    try {
      let branchEventSpendCredits = new BranchEvent(
        BranchEvent.SpendCredits,
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
          alias: 'Spend Credits',
        },
      );
      branchEventSpendCredits.logEvent();
      this.addResult(
        'success',
        'logStandardEventSpendCredits',
        branchEventSpendCredits,
      );
    } catch (err) {
      console.log('sendStandardEvent err', err);
      this.addResult(
        'error',
        'logStandardEventSpendCredits',
        err.toString(),
      );
    }
  };

  logStandardEventCommerceViewAd = async () => {
    if (!this.product) {
      this.dataCommerceShoesAdidas();
    }
    try {
      let branchEventViewAd = new BranchEvent(
        BranchEvent.ViewAd,
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
          alias: 'View AD',
        },
      );
      branchEventViewAd.logEvent();
      this.addResult(
        'success',
        'logStandardEventCommerceViewAd',
        branchEventViewAd,
      );
    } catch (err) {
      console.log('sendStandardEvent err', err);
      this.addResult(
        'error',
        'logStandardEventCommerceViewAd',
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

  logStandardEventContentViewItem = async () => {
    if (!this.product) {
      this.dataCommerceShoesAdidas();
    }
    try {
      let branchEventViewItem = new BranchEvent(
        BranchEvent.ViewItem,
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
      branchEventViewItem.logEvent();
      this.addResult(
        'success',
        'logStandardEventContentViewItem',
        branchEventViewItem,
      );
    } catch (err) {
      console.log('sendStandardEvent err', err);
      this.addResult('error', 'logStandardEventContentViewItem', err.toString());
    }
  };

  logStandardEventContentViewItems = async () => {
    if (!this.product) {
      this.dataCommerceShoesAdidas();
    }
    try {
      let branchEventViewItems = new BranchEvent(
        BranchEvent.ViewItems,
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
      branchEventViewItems.logEvent();
      this.addResult(
        'success',
        'logStandardEventContentViewItems',
        branchEventViewItems,
      );
    } catch (err) {
      console.log('sendStandardEvent err', err);
      this.addResult('error', 'logStandardEventContentViewItems', err.toString());
    }
  };

  logStandardEventContentRate = async () => {
    if (!this.product) {
      this.dataCommerceShoesAdidas();
    }
    try {
      let branchEventRate = new BranchEvent(
        BranchEvent.Rate,
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
      branchEventRate.logEvent();
      this.addResult(
        'success',
        'logStandardEventContentRate',
        branchEventRate,
      );
    } catch (err) {
      console.log('sendStandardEvent err', err);
      this.addResult('error', 'logStandardEventContentRate', err.toString());
    }
  };

  logStandardEventContentShare = async () => {
    if (!this.product) {
      this.dataCommerceShoesAdidas();
    }
    try {
      let branchEventShare = new BranchEvent(
        BranchEvent.Share,
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
      branchEventShare.logEvent();
      this.addResult(
        'success',
        'logStandardEventContentShare',
        branchEventShare,
      );
    } catch (err) {
      console.log('sendStandardEvent err', err);
      this.addResult('error', 'logStandardEventContentShare', err.toString());
    }
  };

  logStandardEventContentInitiateStream = async () => {
    if (!this.product) {
      this.dataCommerceShoesAdidas();
    }
    try {
      let branchEventInitiateStream = new BranchEvent(
        BranchEvent.InitiateStream,
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
      branchEventInitiateStream.logEvent();
      this.addResult(
        'success',
        'logStandardEventContentInitiateStream',
        branchEventInitiateStream,
      );
    } catch (err) {
      console.log('sendStandardEvent err', err);
      this.addResult('error', 'logStandardEventContentInitiateStream', err.toString());
    }
  };

  logStandardEventContentCompleteStream = async () => {
    if (!this.product) {
      this.dataCommerceShoesAdidas();
    }
    try {
      let branchEventCompleteStream = new BranchEvent(
        BranchEvent.CompleteStream,
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
      branchEventCompleteStream.logEvent();
      this.addResult(
        'success',
        'logStandardEventContentCompleteStream',
        branchEventCompleteStream,
      );
    } catch (err) {
      console.log('sendStandardEvent err', err);
      this.addResult('error', 'logStandardEventContentCompleteStream', err.toString());
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

  logStandardEventLifecycleCompleteTutorial = async () => {
    if (!this.product) {
      this.dataCommerceShoesAdidas();
    }
    try {
      let branchEventCompleteTutorial = new BranchEvent(
        BranchEvent.CompleteTutorial,
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
      branchEventCompleteTutorial.logEvent();
      this.addResult(
        'success',
        'logStandardEventLifecycleCompleteTutorial',
        branchEventCompleteTutorial,
      );
    } catch (err) {
      console.log('sendStandardEvent err', err);
      this.addResult(
        'error',
        'logStandardEventLifecycleCompleteTutorial',
        err.toString(),
      );
    }
  };

  logStandardEventLifecycleAchieveLevel = async () => {
    if (!this.product) {
      this.dataCommerceShoesAdidas();
    }
    try {
      let branchEventAchieveLevel = new BranchEvent(
        BranchEvent.AchieveLevel,
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
      branchEventAchieveLevel.logEvent();
      this.addResult(
        'success',
        'logStandardEventLifecycleAchieveLevel',
        branchEventAchieveLevel,
      );
    } catch (err) {
      console.log('sendStandardEvent err', err);
      this.addResult(
        'error',
        'logStandardEventLifecycleAchieveLevel',
        err.toString(),
      );
    }
  };

  logStandardEventLifecycleUnlockAchievement = async () => {
    if (!this.product) {
      this.dataCommerceShoesAdidas();
    }
    try {
      let branchEventUnlockAchievement = new BranchEvent(
        BranchEvent.UnlockAchievement,
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
      branchEventUnlockAchievement.logEvent();
      this.addResult(
        'success',
        'logStandardEventLifecycleUnlockAchievement',
        branchEventUnlockAchievement,
      );
    } catch (err) {
      console.log('sendStandardEvent err', err);
      this.addResult(
        'error',
        'logStandardEventLifecycleUnlockAchievement',
        err.toString(),
      );
    }
  };

  logStandardEventLifecycleInvite = async () => {
    if (!this.product) {
      this.dataCommerceShoesAdidas();
    }
    try {
      let branchEventInvite = new BranchEvent(
        BranchEvent.Invite,
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
      branchEventInvite.logEvent();
      this.addResult(
        'success',
        'logStandardEventLifecycleInvite',
        branchEventInvite,
      );
    } catch (err) {
      console.log('sendStandardEvent err', err);
      this.addResult(
        'error',
        'logStandardEventLifecycleInvite',
        err.toString(),
      );
    }
  };

  logStandardEventLifecycleLogin = async () => {
    if (!this.product) {
      this.dataCommerceShoesAdidas();
    }
    try {
      let branchEventLogin = new BranchEvent(
        BranchEvent.Login,
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
      branchEventLogin.logEvent();
      this.addResult(
        'success',
        'logStandardEventLifecycleLogin',
        branchEventLogin,
      );
    } catch (err) {
      console.log('sendStandardEvent err', err);
      this.addResult(
        'error',
        'logStandardEventLifecycleLogin',
        err.toString(),
      );
    }
  };

  logStandardEventLifecycleStartTrial = async () => {
    if (!this.product) {
      this.dataCommerceShoesAdidas();
    }
    try {
      let branchEventStartTrial = new BranchEvent(
        BranchEvent.StartTrial,
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
      branchEventStartTrial.logEvent();
      this.addResult(
        'success',
        'logStandardEventLifecycleStartTrial',
        branchEventStartTrial,
      );
    } catch (err) {
      console.log('sendStandardEvent err', err);
      this.addResult(
        'error',
        'logStandardEventLifecycleStartTrial',
        err.toString(),
      );
    }
  };

  logStandardEventLifecycleSubscribe = async () => {
    if (!this.product) {
      this.dataCommerceShoesAdidas();
    }
    try {
      let branchEventSubscribe = new BranchEvent(
        BranchEvent.Subscribe,
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
      branchEventSubscribe.logEvent();
      this.addResult(
        'success',
        'logStandardEventLifecycleSubscribe',
        branchEventSubscribe,
      );
    } catch (err) {
      console.log('sendStandardEvent err', err);
      this.addResult(
        'error',
        'logStandardEventLifecycleSubscribe',
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
      transactionID: '12344554',
      currency: 'USD',
      revenue: 1.5,
      shipping: 10.2,
      tax: 12.3,
      coupon: 'Coupon_Y',
      affiliation: 'test_affiliation',
      description: 'Test purchase event',
      searchQuery: 'test keyword',
      alias: 'Custom Event from Android',
      customData: {
        'custom_data_1': 'data 1 customize',
        'custom_data_2': 'data 2 customize',
      },
    };
    let eventTrackingCustom = new BranchEvent('Custom Event from Android', [this.product], params);
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

/**
 * Received Notification before Link opened
 */
receiveNotificationBeforeLinkOpened = async () => {
  try {
    const res = branch.subscribe({
      onOpenStart: ({uri, cachedInitialEvent}) => {
        console.log('Branch will open' + uri);
      },
      onOpenComplete: ({error, params, uri}) => {
        if (error){
          console.error('Error from branch opening uri' + uri);
          return;
        }
        console.log('Branch opened' + uri);
        //handle params
      },
    });
    this.addResult('success', 'receiveNotificationBefore', res);
  } catch (err) {
    console.log('receiveNotificationBefore err', err);
    this.addResult('error', 'receiveNotificationBefore', err.toString());
  }
}

  addResult(type, slug, payload){
    let result = {type, slug, payload};
    this.setState({
      results: [result, ...this.state.results].slice(0, 10),
    });
  }

  render() {
  const { subscribeCount, lastParamString } = this.state;
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
      <Text style={styles.header}>Link Count: {subscribeCount}</Text>
      <ScrollView style={styles.buttonsContainer}>
        <Text>{lastParamString}</Text>
        <Button onPress={this.dataCommerceShoesAdidas}>Create Branch Adidas Object</Button>
        <Button onPress={this.generateShortUrl}>Deep Link - Generate Short URL</Button>
        <Button onPress={this.shareDeepLink}>Deep Link - Share deep link</Button>
        <Button onPress={this.readLastAttributedTouchData}>Deep Link - Read Last Attributed</Button>
        <Button onPress={this.qrCodeFeature}>Try QR Code</Button>
        <Button onPress={this.eventTrackUser}>Event Track User</Button>
        <Button onPress={this.logStandardEventCommercePurchase}>BranchEvent.logEvent (Commerce Purchase)</Button>
        <Button onPress={this.logStandardEventCommerceAddToWhislist}>BranchEvent.logEvent (Commerce Purchase)</Button>
        <Button onPress={this.logStandardEventViewCart}>BranchEvent.logEvent (Commerce View Cart)</Button>
        <Button onPress={this.logStandardEventCommmerceAddPaymentInfo}>BranchEvent.logEvent (Commerce Add Payment Info)</Button>
        <Button onPress={this.logStandardEventCommerceClickAd}>BranchEvent.logEvent (Commerce Click Ad)</Button>
        <Button onPress={this.logStandardEventComerceInitiatePurchase}>BranchEvent.logEvent (Commerce Initiate Purchase)</Button>
        <Button onPress={this.logStandardEventComerceReserve}>BranchEvent.logEvent (Commerce Reserve)</Button>
        <Button onPress={this.logStandardEventCommerceViewAd}>BranchEvent.logEvent (View Ad)</Button>
        <Button onPress={this.logStandardEventSpendCredits}>BranchEvent.logEvent (Spend Credits)</Button>
        <Button onPress={this.logStandardEventContentSearch}>BranchEvent.logEvent (Content Search)</Button>
        <Button onPress={this.logStandardEventContentViewItem}>BranchEvent.logEvent (Content View Item)</Button>
        <Button onPress={this.logStandardEventContentViewItems}>BranchEvent.logEvent (Content View Items)</Button>
        <Button onPress={this.logStandardEventContentRate}>BranchEvent.logEvent (Content Rate)</Button>
        <Button onPress={this.logStandardEventContentShare}>BranchEvent.logEvent (Content Share)</Button>
        <Button onPress={this.logStandardEventContentInitiateStream}>BranchEvent.logEvent (Content Initiate Stream)</Button>
        <Button onPress={this.logStandardEventContentCompleteStream}>BranchEvent.logEvent (Content Complete Stream)</Button>
        <Button onPress={this.logStandardEventLifecycleRegister}>BranchEvent.logEvent (Lifecycle Complete Registration)</Button>
        <Button onPress={this.logStandardEventLifecycleCompleteTutorial}>BranchEvent.logEvent (Lifecycle Complete Tutorial)</Button>
        <Button onPress={this.logStandardEventLifecycleAchieveLevel}>BranchEvent.logEvent (Lifecycle Achieve Level)</Button>
        <Button onPress={this.logStandardEventLifecycleUnlockAchievement}>BranchEvent.logEvent (Lifecycle Unlock Achievement)</Button>
        <Button onPress={this.logStandardEventLifecycleInvite}>BranchEvent.logEvent (Lifecycle Invite)</Button>
        <Button onPress={this.logStandardEventLifecycleLogin}>BranchEvent.logEvent (Lifecycle Login)</Button>
        <Button onPress={this.logStandardEventLifecycleStartTrial}>BranchEvent.logEvent (Lifecycle Start Trial)</Button>
        <Button onPress={this.logStandardEventLifecycleSubscribe}>BranchEvent.logEvent (Lifecycle Subscribe)</Button>
        <Button onPress={this.eventTrackingCustom}>BranchEvent.logEvent (Custom Event)</Button>
        <Button onPress={() => branch.openURL('https://aloysius.app.link/EF8tn2kwmdb')}>Handle Link to YourApp</Button>
        {/* <Button onPress={this.receiveNotificationBeforeLinkOpened}>Notification - Receive notif before link opened</Button> */}
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

/**
 * cd android
 * ./gradlew clean && ./gradlew :app:bundleReleaseJsAndAssets
 */
