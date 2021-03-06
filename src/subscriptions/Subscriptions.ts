import SubscriptionQueries from '../GraphQueries/SubscriptionQueries';
import Repositories from '../repositories/Repositories';
import TransactionHandler from '../TransactionHandler';
import { SubscriptionInfo } from '../types';
import GraphClient from './GraphClient';
import Subscriber from './Subscriber';
import TransactionFetcher from './TransactionFetcher';

/**
 * This class is container that holds instances of all the subscriptions.
 */
export default class Subscriptions {
  public readonly originSubscriber: Subscriber;

  public readonly auxiliarySubscriber: Subscriber;

  /**
   * @param originSubscriber Instance of origin subscriber.
   * @param auxiliarySubscriber Instance of auxiliary subscriber.
   */
  private constructor(originSubscriber: Subscriber, auxiliarySubscriber: Subscriber) {
    this.originSubscriber = originSubscriber;
    this.auxiliarySubscriber = auxiliarySubscriber;
  }

  /**
   * This is a factory method to create subscription container.
   * @param transactionHandler Instance of transaction handler.
   * @param repos Repository container.
   */
  public static async create(
    transactionHandler: TransactionHandler,
    repos: Repositories,
  ): Promise<Subscriptions> {
    const subGraphDetails = Subscriptions.getSubscriptionDetails();
    const originTransactionFetcher: TransactionFetcher = new TransactionFetcher(
      GraphClient.getClient(
        'http',
        subGraphDetails.origin.httpSubGraphEndPoint,
      ),
      repos.contractEntityRepository,
    );
    // Subscription to origin subgraph queries
    const originSubscriber = new Subscriber(
      GraphClient.getClient('ws', subGraphDetails.origin.wsSubGraphEndPoint),
      subGraphDetails.origin.subscriptionQueries,
      transactionHandler,
      originTransactionFetcher,
      repos.contractEntityRepository,
    );
    // Subscription to auxiliary subgraph queries
    const auxiliaryTransactionFetcher: TransactionFetcher = new TransactionFetcher(
      GraphClient.getClient('http', subGraphDetails.auxiliary.httpSubGraphEndPoint),
      repos.contractEntityRepository,
    );
    const auxiliarySubscriber = new Subscriber(
      GraphClient.getClient('ws', subGraphDetails.auxiliary.wsSubGraphEndPoint),
      subGraphDetails.auxiliary.subscriptionQueries,
      transactionHandler,
      auxiliaryTransactionFetcher,
      repos.contractEntityRepository,
    );
    return new Subscriptions(originSubscriber, auxiliarySubscriber);
  }


  /**
   * Subgraph details object which contains chain based subGraphEndPoitn & subscriptionQueries.
   * Note: Replace subGraphEndPoint from Config.ts. It should come from Config:Chain class.
   * Feel free to add subscription queries.
   *
   * @return <any> Object containing chain based subscriptionQueries.
   */
  public static getSubscriptionDetails(): SubscriptionInfo {
    return {
      origin: {
        wsSubGraphEndPoint: 'ws://localhost:8000/subgraphs/name/openst/ost-composer',
        httpSubGraphEndPoint: 'http://localhost:8000/subgraphs/name/openst/ost-composer',
        subscriptionQueries: SubscriptionQueries.origin,
      },
      auxiliary: {
        wsSubGraphEndPoint: 'ws://localhost:8000/subgraphs/name/openst/ost-composer',
        httpSubGraphEndPoint: 'http://localhost:8000/subgraphs/name/openst/ost-composer',
        subscriptionQueries: SubscriptionQueries.auxiliary,
      },
    };
  }
}
