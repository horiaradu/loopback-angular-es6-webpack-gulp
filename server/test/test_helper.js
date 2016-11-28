import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import sinonStubPromise from 'sinon-stub-promise';
import chaiSubset from 'chai-subset';
import chaiSpies from 'chai-spies';

chai.use(chaiAsPromised);
chai.use(sinonChai);
chai.use(chaiSubset);
chai.use(chaiSpies);
chai.should();
sinonStubPromise(sinon);

process.env.NODE_ENV = 'test';
process.env.STORAGE_PROVIDER = 'filesystem';
process.env.STORAGE_ROOT = 'server/test/unit/storage';
process.env.STORAGE_HELP_FOLDER = '';
process.env.STORAGE_CONTAINER = 'test-container';
process.env.AWS_ACCESS_KEY_ID = 'test';
process.env.AWS_SECRET_ACCESS_KEY = 'secret-test';
