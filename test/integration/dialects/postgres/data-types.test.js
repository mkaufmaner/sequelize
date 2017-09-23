'use strict';

const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
// const _ = require('lodash');
// const moment = require('moment');
// const Sequelize = require('../../../../index');
const Support = require(__dirname + '/../../support');
const current = Support.sequelize;
const dialect = Support.getTestDialect();
const DataTypes = require(__dirname + '/../../../../lib/data-types');

if (dialect === 'postgres') {
  describe('[POSTGRES Specific] Data Types', () => {
    describe('DATE', () => {
      // quick test of DATE methods
      it('should validate Infinity/-Infinity as true', () => {
        expect(DataTypes[dialect].DATE().validate(Infinity)).to.equal(true);
        expect(DataTypes[dialect].DATE().validate(-Infinity)).to.equal(true);
      });

      it('should stringify Infinity/-Infinity to infinity/-infinity', () => {
        expect(DataTypes[dialect].DATE().stringify(Infinity)).to.equal('Infinity');
        expect(DataTypes[dialect].DATE().stringify(-Infinity)).to.equal('-Infinity');
      });
    });

    describe('DATE SQL', () => {
      // create dummy user
      it('should be able to create and update records with Infinity/-Infinity', function() {
        this.sequelize.options.typeValidation = true;

        const User = this.sequelize.define('User', {
          username: this.sequelize.Sequelize.STRING,
          beforeTime: {
            type: this.sequelize.Sequelize.DATE,
            defaultValue: -Infinity
          },
          sometime: {
            type: this.sequelize.Sequelize.DATE,
            defaultValue: this.sequelize.fn('NOW')
          },
          anotherTime: {
            type: this.sequelize.Sequelize.DATE
          },
          afterTime: {
            type: this.sequelize.Sequelize.DATE,
            defaultValue: Infinity
          }
        }, {
          timestamps: true
        });

        return User.sync({
          force: true
        }).then(() => {
          return User.create({
            username: 'bob',
            anotherTime: Infinity
          }, {
            validate: true
          });
        }).then(user => {
          expect(user.username).to.equal('bob');
          expect(user.beforeTime).to.equal(-Infinity);
          expect(user.sometime).to.not.equal(Infinity);
          expect(user.anotherTime).to.equal(Infinity);
          expect(user.afterTime).to.equal(Infinity);

          return user.update({
            sometime: Infinity
          });
        }).then(user => {
          expect(user.sometime).to.equal(Infinity);

          return user.update({
            sometime: this.sequelize.fn('NOW')
          });
        }).then(user => {
          expect(user.sometime).to.not.equal(Infinity);

          // find
          return User.findAll();
        }).then(users => {
          expect(users[0].beforeTime).to.equal(-Infinity);
          expect(users[0].sometime).to.not.equal(Infinity);
          expect(users[0].afterTime).to.equal(Infinity);
        });
      });

    });
  });
}
